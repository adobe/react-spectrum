import {Collection, Layout, LayoutInfo} from '@react-stately/collections';
import {DOMProps} from '@react-types/shared';
import React, {CSSProperties, JSXElementConstructor} from 'react';
import {ScrollView} from './ScrollView';
import {useCollectionState} from '@react-stately/collections';

interface CollectionViewProps<T, V> extends DOMProps {
  children: (type: string, content: T) => V,
  layout: Layout<T>,
  collection: Collection<T>,
  elementType?: string | JSXElementConstructor<any>
}

export function CollectionView<T, V>(props: CollectionViewProps<T, V>) {
  let {children: renderView, layout, collection, ...otherProps} = props;
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
  
  return (
    <ScrollView 
      {...otherProps}
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
