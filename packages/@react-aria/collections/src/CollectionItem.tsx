import {LayoutInfo} from '@react-stately/collections';
import React, {CSSProperties, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import {useCollectionItem} from './useCollectionItem';

interface CollectionItemProps<T extends object, V> {
  reusableView: ReusableView<T, V>,
  parent?: ReusableView<T, V>
}

export function CollectionItem<T extends object, V>(props: CollectionItemProps<T, V>) {
  let {reusableView, parent} = props;
  let ref = useRef();
  useCollectionItem({
    reusableView,
    ref
  });

  return (
    <div role="presentation" ref={ref} style={layoutInfoToStyle(reusableView.layoutInfo, parent && parent.layoutInfo)}>
      {reusableView.rendered}
    </div>
  );
}

export function layoutInfoToStyle(layoutInfo: LayoutInfo, parent?: LayoutInfo | null): CSSProperties {
  return {
    position: 'absolute',
    overflow: 'hidden',
    top: layoutInfo.rect.y - (parent ? parent.rect.y : 0),
    left: layoutInfo.rect.x - (parent ? parent.rect.x : 0),
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
