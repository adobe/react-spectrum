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
import {ButtonProps} from 'react-aria-components/Button'
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
  TabListStateContext,
} from 'react-aria-components/Tabs';
// import {Button} from 'react-aria-components/Button';
import {Button} from '@react-spectrum/s2/Button';
import {FocusScope} from 'react-aria/FocusScope';
import {createContext, useContext, useLayoutEffect, useState, useRef, useReducer, ReactNode, RefObject} from 'react';
import {Key} from '@react-types/shared';
import { ModalOverlay, Modal, Dialog} from 'react-aria-components/Modal';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
import {ImageContext} from '@react-spectrum/s2/Image';
export interface LightboxCarouselProps extends Omit<TabsProps, 'className'> {
  isInfinite?: boolean;
};

export type LightboxPickerProps<T> = Omit<TabListProps<T>, 'className'>;
export interface LightboxPickerItemProps extends Omit<TabProps, 'className' | 'children'>{
  children: ReactNode;
}
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
  minHeight: 0,
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
  flexShrink: 0,
  gap: 4
});

const pickerItemStyles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'lg',
  cursor: 'default',
  boxSizing: 'border-box',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-800'
  }
});

const itemsStyles = style({
  minWidth: 0,
  minHeight: 0,
  borderRadius: 'lg',
  width: 'full',
  height: 'full',
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
  minHeight: 0,
  width: 'full',
  height: 'full',
  flexShrink: 0,
  scrollSnapAlign: 'start',
  scrollSnapStop: 'always'
});

const buttonStyles = style({
  size: 32,
  borderRadius: 'full',
  borderStyle: 'none',
})

interface LightboxCarouselContextProps {
  isInfinite?: boolean;
}

let LightBoxCarouselContext = createContext<LightboxCarouselContextProps>({});

export function LightboxCarousel(props: LightboxCarouselProps) {

  let ctx = useContext(LightboxTriggerContext);

  if (ctx) {
    return (
      <ModalOverlay
          isOpen={ctx.isOpen}
          onOpenChange={ctx.setIsOpen}
          isDismissable
          className={style({
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'black/90'
          })}>
          <Modal className={style({width: 'full', height: 'full'})}>
            <Dialog
              className={style({
                display: 'grid',
                gridTemplateRows: ['auto', 'minmax(0, 1fr)'],
                gap: 24,
                boxSizing: 'border-box',
                height: 'full',
                padding: 24,
                color: 'white'
              })}>
              {({close}) => (
                <>
                <CloseButton staticColor="white" onPress={close} />
                    <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}>
                      <RACTabs {...props} selectedKey={ctx?.activeKey} onSelectionChange={ctx?.setActiveKey} className={renderProps => carouselStyles(renderProps)} />
                    </LightBoxCarouselContext.Provider>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
    )
  }

  // maybe if there is a lightbox trigger context, then we render it as a modal, but otherwise, we just render the tabs?
  return (
    <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}>
      <RACTabs {...props} className={renderProps => carouselStyles(renderProps)} />
    </LightBoxCarouselContext.Provider>
  )
}

export function LightboxPicker<T>(props: LightboxPickerProps<T>) {
  let ctx = useContext(LightboxTriggerContext);
  let state = useContext(TabListStateContext);
  let picker = <RACTabList {...props} className={renderProps => pickerStyles(renderProps)} />;

  // Wait until tab state has initialized its focus target before running autofocus.
  return state?.selectionManager.focusedKey != null ? (
    <FocusScope autoFocus={ctx?.isOpen ?? false}>
      {picker}
    </FocusScope>
  ) : picker;
}


const thumbnailStyles = style({
  width: 64,
  height: 64,
  objectFit: 'cover',
  borderRadius: 'lg',
  opacity: .8
})

export function LightboxPickerItem(props: LightboxPickerItemProps) {
  return (
      <RACTab {...props} className={renderProps => pickerItemStyles(renderProps)}>
        <ImageContext.Provider value={{styles: thumbnailStyles}}>
          {props.children}
        </ImageContext.Provider>
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
    <div className={style({
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
      minWidth: 0,
      minHeight: 0
    })}>
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
      <CarouselNavButton onPress={prevItem} side="start" />
      {/* <Button onPress={prevItem} className={buttonStyles}><ChevronLeft /></Button> */}
        <div ref={ref} {...props} className={itemsStyles} onScroll={onScroll} onScrollEnd={onScrollEnd}>
          {props.children}
        </div>
      <CarouselNavButton onPress={nextItem} side="end" />
      {/* <Button onPress={nextItem} className={buttonStyles}><ChevronRight /></Button> */}
    </>
  )
}

interface CarouselNavButtonProps extends ButtonProps {
  side?: 'start' | 'end'
}

function CarouselNavButton(props: CarouselNavButtonProps) {
  let {side, ...otherProps} = props; 
  // let {direction} = useLocale();
  // let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let Icon = side === 'start' ? ChevronLeft : ChevronRight;
  return (
    <Button
      {...otherProps}
      variant="secondary"
      // aria-label={stringFormatter.format(
      //   side === 'start' ? 'attachmentlist.previousAttachments' : 'attachmentlist.nextAttachments'
      // )}
      // style={pressScale(ref, {
      //   animationTimeline: '--carousel-scroll',
      //   animationRange: side === 'start' ? '0px 32px' : 'calc(100% - 32px) 100%'
      // } as CSSProperties)}>
      >
      <Icon />
    </Button>
  );
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

const imageStyles = style({
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: 'full',
  maxHeight: 'full',
  objectFit: 'contain',
  borderRadius: 'lg'
});

interface InfiniteLightboxItemsProps<T> extends Omit<LightboxItemsProps<T>, 'children'> {
  children: (page: number) => ReactNode,
  viewportRef?: RefObject<HTMLDivElement | null>
}

function InfiniteLightboxItems<T>(props: InfiniteLightboxItemsProps<T>) {
  let {children: renderPage} = props;
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);


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
  }

  let onScrollEnd = () => {
    console.log('scrollend')
    // update the centered page once scrolling is done
    dispatch({type: 'SCROLL_END'});
  }

  return (
    <>
      <CarouselNavButton onPress={prevItem} side="start" />
      <div ref={ref} onScroll={onScroll} onScrollEnd={onScrollEnd} className={itemsStyles}>
        <ImageContext.Provider value={{styles: imageStyles}}>
          {/* Placeholder to hold space in the scroll width for more pages. */}
          <div
            style={{
              width: (currentPage - 1) * 100 + '%',
              flexShrink: 0,
              contain: 'strict',
            }}
          />
          {/* contain: 'inline-size' makes these extra pages not affect the width of the parent */}
          <div inert style={{width: '100%', height: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
            {renderPage(selectedIndex - 1)}
          </div>
          {/* Center (visible) page */}
          <div style={{width: '100%', height: '100%', flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
            {renderPage(selectedIndex )}
          </div>
          <div inert style={{width: '100%', height: '100%', flexShrink: 0, contain: 'inline-size', scrollSnapAlign: 'start', scrollSnapStop: 'always'}}>
            {renderPage(selectedIndex + 1)}
          </div>
          <div
            style={{
              width: (PAGES * 2 - currentPage - 1) * 100 + '%',
              flexShrink: 0,
              contain: 'strict',
            }}
          />
        </ImageContext.Provider>
      </div>
      <CarouselNavButton onPress={nextItem} side="end" />
    </>
  )
}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} shouldForceMount className={renderProps => itemStyles(renderProps)} />
  );
}

export interface LightboxTriggerContextProps {
  onAction?: (key: Key) => void;
  isOpen?: boolean;
  setIsOpen?: (boolean) => void;
  activeKey?: Key | undefined;
  setActiveKey?: (key: Key) => void;
}

export const LightboxTriggerContext = createContext<LightboxTriggerContextProps | null>(null);

interface LightboxTrigger {
  children: ReactNode
};

export function LightboxTrigger(props: LightboxTrigger) {
  let [isOpen, setIsOpen] = useState<boolean>(false);
  let [activeKey, setActiveKey] = useState<Key | undefined>(undefined);
  
  let onAction = (key: Key) => {
    setActiveKey(key);
    setIsOpen(true);
  }

  return (
    <LightboxTriggerContext.Provider value={{isOpen, setIsOpen, onAction, activeKey, setActiveKey}}>
      <div {...props}>
        {props.children}
      </div>
    </LightboxTriggerContext.Provider>
  )
}
