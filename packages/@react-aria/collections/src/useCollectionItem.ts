import {CollectionManager, LayoutInfo, Size} from '@react-stately/collections';
import {RefObject, useCallback, useLayoutEffect} from 'react';

interface CollectionItemOptions<T extends object, V, W> {
  layoutInfo: LayoutInfo,
  collectionManager: CollectionManager<T, V, W>,
  ref: RefObject<HTMLElement>
}

export function useCollectionItem<T extends object, V, W>(options: CollectionItemOptions<T, V, W>) {
  let {layoutInfo, collectionManager, ref} = options;

  let updateSize = useCallback(() => {
    let size = getSize(ref.current);
    collectionManager.updateItemSize(layoutInfo.key, size);
  }, [collectionManager, layoutInfo.key, ref]);

  useLayoutEffect(() => {
    if (layoutInfo.estimatedSize) {
      updateSize();
    }
  });

  return {updateSize};
}

function getSize(node: HTMLElement) {
  // Get bounding rect of all children
  let top = Infinity, left = Infinity, bottom = 0, right = 0;
  for (let child of Array.from(node.childNodes)) {
    let rect = (child as HTMLElement).getBoundingClientRect();
    top = Math.min(top, rect.top);
    left = Math.min(left, rect.left);
    bottom = Math.max(bottom, rect.bottom);
    right = Math.max(right, rect.right);
  }

  return new Size(right - left, bottom - top);
}
