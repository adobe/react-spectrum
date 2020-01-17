import React, {RefObject, useEffect, useState} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';
import {useLocale} from '@react-aria/i18n';

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

  let {direction} = useLocale();
  let isCollapsible = maxVisibleItems === 'auto';
  let childArray = React.Children.toArray(children);

  const [visibleItems, setVisibleItems] = useState(isCollapsible ? childArray.length : maxVisibleItems);

  useEffect(() => {
    let listItems = Array.from(ref.current.children);
    let childrenRect = listItems.map(child => child.getBoundingClientRect());

    let onResize = () => {
      if (isCollapsible && ref.current) {
        let containerRect = ref.current.getBoundingClientRect();
        let index = childrenRect.findIndex(childRect => 
          direction === 'rtl' ? childRect.left < containerRect.left : childRect.right > containerRect.right
        );

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
  }, [isCollapsible, showRoot, direction, childArray.length, ref]);

  return {
    visibleItems,
    setVisibleItems
  };
}
