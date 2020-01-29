import React, {useCallback, useState} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';

const MIN_VISIBLE_ITEMS = 2;
const MAX_VISIBLE_ITEMS = 4;

export interface BreadcrumbsState {
  visibleItems?: 'auto' | number,
  setVisibleItems: (childrenWidthTotals: number[], containerWidth: number) => void
}

export function useBreadcrumbsState(props: SpectrumBreadcrumbsProps): BreadcrumbsState {
  let {
    showRoot,
    maxVisibleItems = MAX_VISIBLE_ITEMS,
    children
  } = props;

  let childArray = React.Children.toArray(children);

  const [visibleItems, setVisibleItems] = useState(maxVisibleItems === 'auto' ? childArray.length : maxVisibleItems);

  let setVisibleItemsValue = (childrenWidthTotals, containerWidth) => {
    let index = childrenWidthTotals.findIndex(totalWidth => totalWidth > containerWidth);

    let visibleItemsCount;
    let minVisibleItems = showRoot ? MIN_VISIBLE_ITEMS + 1 : MIN_VISIBLE_ITEMS;

    if (index ===  -1) {
      visibleItemsCount = childArray.length;
    } else if (index < minVisibleItems) {
      visibleItemsCount = minVisibleItems;
    } else {
      visibleItemsCount = index;
    }

    setVisibleItems(visibleItemsCount);
  };

  return {
    visibleItems,
    setVisibleItems: useCallback(setVisibleItemsValue, [showRoot, maxVisibleItems])
  };
}
