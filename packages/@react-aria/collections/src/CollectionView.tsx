import {Collection, Layout, LayoutInfo} from '@react-stately/collections';
import {DOMProps} from '@react-types/shared';
import React, {CSSProperties, FocusEvent, Key, useCallback, useEffect, useRef} from 'react';
import {ScrollView} from './ScrollView';
import {useCollectionState} from '@react-stately/collections';

interface CollectionViewProps<T extends object, V> extends DOMProps {
  children: (type: string, content: T) => V,
  layout: Layout<T>,
  collection: Collection<T>,
  focusedKey?: Key
}

export function CollectionView<T extends object, V>(props: CollectionViewProps<T, V>) {
  let {children: renderView, layout, collection, focusedKey, ...otherProps} = props;
  let {
    visibleViews,
    visibleRect,
    setVisibleRect,
    contentSize,
    isAnimating,
    collectionManager
  } = useCollectionState({
    layout,
    collection,
    renderView,
    renderWrapper: (reusableView) => (
      <div key={reusableView.key} role="presentation" style={layoutInfoToStyle(reusableView.layoutInfo)}>
        {reusableView.rendered}
      </div>
    )
  });

  let ref = useRef<HTMLDivElement>();

  // Scroll to the focusedKey when it changes. Actually focusing the focusedKey
  // is up to the implementation using CollectionView since we don't have refs
  // to all of the item DOM nodes.
  useEffect(() => {
    if (focusedKey) {
      collectionManager.scrollToItem(focusedKey);
    }
  }, [focusedKey, collectionManager]);

  let isFocusWithin = useRef(false);
  let onFocus = useCallback((e: FocusEvent) => {
    // If the focused item is scrolled out of view and is not in the DOM, the CollectionView
    // will have tabIndex={0}. When tabbing in from outside, scroll the focused item into view.
    // We only want to do this if the CollectionView itself is receiving focus, not a child
    // element, and we aren't moving focus to the CollectionView from within (see below).
    if (e.target === ref.current && !isFocusWithin.current) {
      collectionManager.scrollToItem(focusedKey);
    }

    isFocusWithin.current = e.target !== ref.current;
  }, [focusedKey, collectionManager]);

  let onBlur = useCallback((e: FocusEvent) => {
    isFocusWithin.current = ref.current.contains(e.relatedTarget as Element);
  }, []);

  // When the focused item is scrolled out of view and is removed from the DOM, 
  // move focus to the collection view as a whole if focus was within before.
  let focusedView = collectionManager.getItemView(focusedKey);
  useEffect(() => {
    if (focusedKey && !focusedView && isFocusWithin.current && document.activeElement !== ref.current) {
      ref.current.focus();
    }
  });
  
  return (
    <ScrollView 
      {...otherProps}
      tabIndex={focusedView ? undefined : 0}
      ref={ref}
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      innerStyle={isAnimating ? {transition: `none ${collectionManager.transitionDuration}ms`} : undefined}
      contentSize={contentSize}
      visibleRect={visibleRect}
      onVisibleRectChange={setVisibleRect}>
      {visibleViews}
    </ScrollView>
  );
}

function layoutInfoToStyle(layoutInfo: LayoutInfo): CSSProperties {
  return {
    position: 'absolute',
    overflow: 'hidden',
    top: layoutInfo.rect.y,
    left: layoutInfo.rect.x,
    transition: 'all',
    WebkitTransition: 'all',
    WebkitTransitionDuration: 'inherit',
    transitionDuration: 'inherit',
    width: layoutInfo.rect.width + 'px',
    height: layoutInfo.rect.height + 'px',
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform,
    contain: 'size layout style paint'
  };
}
