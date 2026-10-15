/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  TabPanels as RACTabPanels,
  Tabs as RACTabs,
  TabListProps,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsProps,
  TabListStateContext
} from 'react-aria-components/Tabs';
import {Button} from 'react-aria-components/Button';
import {createContext, useContext, useLayoutEffect, useState, useRef, useReducer, ReactNode, RefObject} from 'react';

export interface LightboxCarouselProps extends Omit<TabsProps, 'className'> {
  isInfinite?: boolean;
};

export type LightboxPickerProps<T> = Omit<TabListProps<T>, 'className'>;
export type LightboxPickerItemProps = Omit<TabProps, 'className' | 'children'>;
export interface LightboxItemsProps<T> extends Omit<TabPanelsProps<T>, 'className'> {
  children: ReactNode[]
}
export type LightboxItemProps = Omit<TabPanelProps, 'className'>;

const carouselStyles = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'column',
      vertical: 'row'
    }
  },
  gap: 16,
  minWidth: 0,
  width: 'full'
});

const pickerStyles = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'row',
      vertical: 'column'
    }
  },
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4
});

const pickerItemStyles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 32,
  minHeight: 32,
  borderRadius: 'full',
  cursor: 'default'
});

const pickerDotStyles = style({
  size: 8,
  flexShrink: 0,
  borderRadius: 'full',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'gray-600',
  backgroundColor: {
    default: 'gray-300',
    isSelected: 'gray-900'
  }
});

const itemsStyles = style({
  minWidth: 0,
  width: 'full',
  display: 'flex',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollbarWidth: 'none',
  scrollSnapType: 'x mandatory',
  scrollBehavior: 'smooth'
});

const itemStyles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  width: 'full',
  flexShrink: 0,
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always'
});

interface LightboxCarouselContextProps {
  isInfinite?: boolean;
}

let LightBoxCarouselContext = createContext<LightboxCarouselContextProps>({});

export function LightboxCarousel(props: LightboxCarouselProps) {
  return (
    <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}>
      <RACTabs {...props} className={renderProps => carouselStyles(renderProps)} />
    </LightBoxCarouselContext.Provider>
  )
}

export function LightboxPicker<T>(props: LightboxPickerProps<T>) {
  return <RACTabList {...props} className={renderProps => pickerStyles(renderProps)} />;
}

export function LightboxPickerItem(props: LightboxPickerItemProps) {
  return (
    <RACTab {...props} className={renderProps => pickerItemStyles(renderProps)}>
      {renderProps => <span aria-hidden="true" className={pickerDotStyles(renderProps)} />}
    </RACTab>
  );
}

export function LightboxItems<T>(props: LightboxItemsProps<T>) {
  let state = useContext(TabListStateContext)!;
  // let ref = useRef<HTMLDivElement | null>(null);
  let {isInfinite} = useContext(LightBoxCarouselContext);

  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null
    ? state?.collection.getItem(selectedKey)
    : null;

  if (selectedItem == null) {
    return null;
}


  let wrapper: ReactNode = isInfinite ? (
    <InfiniteLightboxItems>
      {(index) => props.children?.at(index % state.collection.size)}
    </InfiniteLightboxItems>
  ) : (
    <FiniteLightboxItems>
      {props.children}
    </FiniteLightboxItems>
  );

  return (
    <div className={style({display: 'flex'})}>
      {wrapper}
    </div>
  );
}

interface FiniteLightboxItemsProps<T> extends LightboxItemsProps<T> {
  viewportRef?: RefObject<HTMLDivElement | null>
}

function FiniteLightboxItems<T>(props: FiniteLightboxItemsProps<T>) {
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);
  let isProgrammaticScroll = useRef(false);

  // do we want to disable the prev/next button if you are at the start/end?
  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null
    ? state?.collection.getItem(selectedKey)
    : null;

  let selectedIndex = selectedItem != null ? selectedItem.index : null;
  
  useLayoutEffect(() => {
    // When a user clicks prev/next, that changes the selected tab but not the scroll position
    // Check if the scroll position doesn't match the selected tab and adjust accordingly
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;
    if (selectedIndex != currentIndex ) {
      isProgrammaticScroll.current = true;
      ref.current!.scrollLeft = ref.current!.offsetWidth * (selectedIndex ?? 0);
    }
  }, [selectedKey]);

      let prevItem = () => {
    let key = state.selectedKey;
    let isFirstKey = state.collection.getFirstKey() === key

    let prevKey = key ? state.collection.getKeyBefore(key) : null;
    if (isFirstKey) {
      prevKey = state.collection.getFirstKey();
    }
    state.setSelectedKey(prevKey);
  };

  let nextItem = () => {
    let key = state.selectedKey;
    let isLastKey = state.collection.getLastKey() === key;
    let nextKey = key ? state.collection.getKeyAfter(key) : null;
    if (isLastKey) {
      nextKey = key;
    }
    state.setSelectedKey(nextKey);
  };

  let onScroll = () => {
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;

    // Update the selected tab when scrolling (but do not update when the scrolling is coming from next/prev buttons)
    if (selectedIndex !== currentIndex && !isProgrammaticScroll.current) {
      let key = [...state.collection].at(currentIndex)?.key;
      if (key) {
        state.setSelectedKey(key)
      }
    }
  }

  let onScrollEnd = () => {
    isProgrammaticScroll.current = false;
  }

  return (
    <>
      <Button onPress={prevItem}>Prev</Button>
        <div ref={ref} {...props} className={itemsStyles} onScroll={onScroll} onScrollEnd={onScrollEnd}>
          {props.children}
        </div>
      <Button onPress={nextItem}>Next</Button>
    </>
  )
}

interface CarouselState {
  centerPage: number;
  currentPage: number;
}

type Action =
  | { type: 'SCROLL'; page: number }
  | { type: 'SCROLL_END' }
  | { type: 'SET_CENTER_PAGE'; page: number };

const PAGES = 100;

function reducer(state: CarouselState, action: Action) {
  let {centerPage, currentPage} = state;
  switch (action.type) {
    case 'SET_CENTER_PAGE':
      return {centerPage: action.page, currentPage: PAGES}
    case 'SCROLL':
      if (action.page === currentPage) {
        return state;
      }
      return {centerPage, currentPage: action.page}
    case 'SCROLL_END':
      if (currentPage === PAGES) {
        return state;
      }
      return {
        centerPage: centerPage + currentPage - PAGES, currentPage: PAGES
      }
  }
}

interface InfiniteLightboxItemsProps<T> extends Omit<LightboxItemsProps<T>, 'children'> {
  children: (page: number) => ReactNode,
  viewportRef?: RefObject<HTMLDivElement | null>
}

function InfiniteLightboxItems<T>(props: InfiniteLightboxItemsProps<T>) {
  let {children: renderPage} = props;
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);
  let isProgrammaticScrolling = useRef<boolean>(false);


  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null
    ? state?.collection.getItem(selectedKey)
    : null;

  let selectedIndex = selectedItem != null ? selectedItem.index : null; 

  if (!state || selectedIndex == null || state.collection.size === 0) {
    return null;
  }


  let [{centerPage, currentPage}, dispatch] = useReducer(reducer, null, () => ({centerPage: selectedIndex ?? 0, currentPage: PAGES}))

  // if the selected tab changes (like if you were to click one), update the centered page
  if (selectedIndex != null && currentPage === PAGES && selectedIndex !== centerPage) {
    // console.log(selectedIndex);
    dispatch({
      type: 'SET_CENTER_PAGE',
      page: selectedIndex
    })
  }

  // when the center page changes, reset the scroll position
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    console.log('layout');
    
    // ref.current!.scrollLeft = ref.current!.offsetWidth * PAGES;

    ref.current.scrollTo({
      left: ref.current.offsetWidth * PAGES,
      behavior: 'instant'
    });
  }, [centerPage]);

  let prevItem = () => {
    if (!ref.current) {
      return;
    }

    ref.current!.scrollLeft = ref.current!.offsetWidth * (PAGES - 1);
  }

  let nextItem = () => {
    if (!ref.current) {
      return;
    }
    
    ref.current!.scrollLeft = ref.current!.offsetWidth * (PAGES + 1);
  }

  // update selected tab while scrolling
  let onScroll = () => {
    let el = ref.current;
    let index = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0; // this is not the collection index, this is the pages index 
    let collectionIndex = centerPage + index - PAGES; // this is the actual collection index
    if (currentPage !== index) {
      // actually update the selected key (so that the tabs actually reflect what is in the viewport)
      let key = [...state.collection].at(collectionIndex % state.collection.size)?.key;
      if (key) {
        state.setSelectedKey(key);
      }
      // keeps track of how much we have scrolled from the center page
      dispatch({
        type: 'SCROLL',
        page: index
      })
    }
    console.log('onscroll');
  }

  let onScrollEnd = () => {
    console.log('scrollend')
    // update the centered page once scrolling is done
    dispatch({type: 'SCROLL_END'});
  }

  return (
    <>
      <Button onPress={prevItem}>Prev</Button>
      <div ref={ref} onScroll={onScroll} onScrollEnd={onScrollEnd} className={itemsStyles}>
        {/* Placeholder to hold space in the scroll width for more pages. */}
        <div
          style={{
            width: (currentPage - 1) * 100 + '%',
            flexShrink: 0,
            contain: 'strict',
          }}
        />
        {/* contain: 'inline-size' makes these extra pages not affect the width of the parent */}
        <div inert style={{width: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          {renderPage(selectedIndex - 1)}
        </div>
        {/* Center (visible) page */}
        <div style={{width: '100%', flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          {renderPage(selectedIndex )}
        </div>
        <div inert style={{width: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
          {renderPage(selectedIndex + 1)}
        </div>
        <div
          style={{
            width: (PAGES * 2 - currentPage - 1) * 100 + '%',
            flexShrink: 0,
            contain: 'strict',
          }}
        />
      </div>
      <Button onPress={nextItem}>Next</Button>
    </>
  )
}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} shouldForceMount className={renderProps => itemStyles(renderProps)} />
  );
}
