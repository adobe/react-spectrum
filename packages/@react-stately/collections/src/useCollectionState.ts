import {Collection} from './types';
import {CollectionManager} from './CollectionManager';
import {Key, useLayoutEffect, useMemo, useState} from 'react';
import {Layout} from './Layout';
import {Rect} from './Rect';
import {ReusableView} from './ReusableView';
import {Size} from './Size';

interface CollectionProps<T extends object, V, W> {
  renderView(type: string, content: T): V,
  renderWrapper(reusableView: ReusableView<T, V>): W,
  layout: Layout<T>,
  collection: Collection<T>,
  getScrollAnchor?(rect: Rect): Key
}

interface CollectionState<T extends object, V, W> {
  visibleViews: Set<W>,
  visibleRect: Rect,
  setVisibleRect: (rect: Rect) => void,
  contentSize: Size,
  isAnimating: boolean,
  collectionManager: CollectionManager<T, V, W>
}

export function useCollectionState<T extends object, V, W>(opts: CollectionProps<T, V, W>): CollectionState<T, V, W> {
  let [visibleViews, setVisibleViews] = useState(new Set<W>());
  let [visibleRect, setVisibleRect] = useState(new Rect());
  let [contentSize, setContentSize] = useState(new Size());
  let [isAnimating, setAnimating] = useState(false);
  let collectionManager = useMemo(() => new CollectionManager<T, V, W>(), []);

  collectionManager.delegate = {
    setVisibleViews,
    setVisibleRect,
    setContentSize,
    renderView: opts.renderView,
    renderWrapper: opts.renderWrapper,
    beginAnimations: () => setAnimating(true),
    endAnimations: () => setAnimating(false),
    getScrollAnchor: opts.getScrollAnchor
  };

  collectionManager.layout = opts.layout;
  collectionManager.collection = opts.collection;
  collectionManager.visibleRect = visibleRect;

  useLayoutEffect(() => {
    collectionManager.afterRender();
  });

  return {
    collectionManager,
    visibleViews,
    visibleRect,
    setVisibleRect,
    contentSize,
    isAnimating
  };
}
