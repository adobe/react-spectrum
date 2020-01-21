import React, {RefObject, useEffect, useState} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';

const MIN_VISIBLE_ITEMS = 2;
const MAX_VISIBLE_ITEMS = 4;

export interface BreadcrumbsState {
  visibleItems: 'auto' | number,
  setVisibleItems: (value:number) => void
}

export function useBreadcrumbsState(props: SpectrumBreadcrumbsProps, ref: RefObject<HTMLUListElement>): BreadcrumbsState {
  let {
    showRoot,
    maxVisibleItems = MAX_VISIBLE_ITEMS,
    children
  } = props;

  let isCollapsible = maxVisibleItems === 'auto';
  let childArray = React.Children.toArray(children);

  const [visibleItems, setVisibleItems] = useState(isCollapsible ? childArray.length : maxVisibleItems);

  useEffect(() => {
    let listItems = Array.from(ref.current.children);
    let itemsWidthTotals = listItems.reduce((acc, item, index) => (
      [...acc, acc[index] + item.getBoundingClientRect().width]
    ), [0]);

    let onResize = () => {
      if (isCollapsible && ref.current) {
        let containerWidth = ref.current.getBoundingClientRect().width;
        let index = itemsWidthTotals.findIndex(childRect => childRect > containerWidth);

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
      }
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [isCollapsible, childArray.length, ref, showRoot]);

  return {
    visibleItems,
    setVisibleItems
  };
}
