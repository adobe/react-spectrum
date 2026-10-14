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
  children: ReactNode
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
  overflow: 'auto',
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
  // let isProgrammaticScroll = useRef(false);

  // do we want to disable the prev/next button if you are at the start/end?

  // let selectedKey = state?.selectedKey;
  // let selectedItem = selectedKey != null
  //   ? state?.collection.getItem(selectedKey)
  //   : null;

  // let selectedIndex = selectedItem != null ? selectedItem.index : null


  let prevItem = () => {
    let key = state.selectedKey;
    let isFirstKey = state.collection.getFirstKey() === key
    if (isInfinite) {
      if (isFirstKey) {
        state.setSelectedKey(state.collection.getLastKey());
        // Check case where there is only one item...
        return;
      }
    }

    let prevKey = key ? state.collection.getKeyBefore(key) : null;
    if (isFirstKey) {
      prevKey = state.collection.getFirstKey();
    }
    state.setSelectedKey(prevKey);
  };

  let nextItem = () => {
    let key = state.selectedKey;
    let isLastKey = state.collection.getLastKey() === key;
    if (isInfinite) {
      if (isLastKey) {
        state.setSelectedKey(state.collection.getFirstKey());
        // Check case where there is only one item...
        return;
      }
    }

    let nextKey = key ? state.collection.getKeyAfter(key) : null;
    if (isLastKey) {
      nextKey = key;
    }
    state.setSelectedKey(nextKey);
  };

  let wrapper: ReactNode = isInfinite ? (
    <InfiniteLightboxItems>
      {props.children}
    </InfiniteLightboxItems>
  ) : (
    <FiniteLightboxItems>
      {props.children}
    </FiniteLightboxItems>
  );

  return (
    <div className={style({display: 'flex'})}>
      <Button onPress={prevItem}>Prev</Button>
        {wrapper}
      <Button onPress={nextItem}>Next</Button>
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

  let selectedIndex = selectedItem != null ? selectedItem.index : null
  
  useLayoutEffect(() => {
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;
    if (selectedIndex != currentIndex ) {
      isProgrammaticScroll.current = true;
      ref.current!.scrollLeft = ref.current!.offsetWidth * (selectedIndex ?? 0);
    }
  }, [selectedKey]);


  let onScroll = () => {
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;
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
    <div ref={ref} {...props} className={itemsStyles} onScroll={onScroll} onScrollEnd={onScrollEnd}>
      {props.children}
    </div>
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


interface InfiniteLightboxItemsProps<T> extends LightboxItemsProps<T> {
  viewportRef?: RefObject<HTMLDivElement | null>
}

function InfiniteLightboxItems<T>(props: InfiniteLightboxItemsProps<T>) {
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);
  let {isInfinite} = useContext(LightBoxCarouselContext);
  let isProgrammaticScroll = useRef(false);

  // do we want to disable the prev/next button if you are at the start/end?

  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null
    ? state?.collection.getItem(selectedKey)
    : null;

  let selectedIndex = selectedItem != null ? selectedItem.index : null
  
  // FOR INFINITE CAROUSEL //
  let [{centerPage, currentPage}, dispatch] = useReducer(reducer, null, () => ({centerPage: selectedIndex ?? 0, currentPage: PAGES}))

  if (isInfinite && selectedIndex != null && currentPage === PAGES && selectedIndex !== centerPage) {
    dispatch({
      type: 'SET_CENTER_PAGE',
      page: selectedIndex
    })
  }
  // ------------------------------------ //

  useLayoutEffect(() => {
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;
    if (selectedIndex != currentIndex ) {
      isProgrammaticScroll.current = true;
      ref.current!.scrollLeft = ref.current!.offsetWidth * (selectedIndex ?? 0);
    }
  }, [selectedKey]);


  let onScroll = () => {
    let el = ref.current;
    let currentIndex = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0;
    if (selectedIndex !== currentIndex && !isProgrammaticScroll.current) {
      let key = [...state.collection].at(currentIndex)?.key;
      if (key) {
        state.setSelectedKey(key)
      }
    }

    if (isInfinite && currentPage !== currentIndex) {
        dispatch({
          type: 'SCROLL',
          page: currentIndex
        })
    }
  }

  return (
    <div ref={ref}>
      {props.children}
    </div>
  )
}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} shouldForceMount className={renderProps => itemStyles(renderProps)} />
  );
}
