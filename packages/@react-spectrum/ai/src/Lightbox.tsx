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

import {Button, ButtonProps} from '@react-spectrum/s2/Button';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
import {createContext, ReactNode, useContext, useReducer, useRef, useState} from 'react';
import {Dialog, Modal, ModalOverlay} from 'react-aria-components/Modal';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {FocusScope} from 'react-aria/FocusScope';
import {ImageContext} from '@react-spectrum/s2/Image';
import {Key} from '@react-types/shared';
import {
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  Tabs as RACTabs,
  TabListProps,
  TabListStateContext,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsProps
} from 'react-aria-components/Tabs';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

export interface LightboxCarouselProps extends Omit<TabsProps, 'className'> {
  isInfinite?: boolean;
}

export interface LightboxPickerProps<T> extends Omit<TabListProps<T>, 'className'> {}
export interface LightboxPickerItemProps extends Omit<TabProps, 'className' | 'children'> {
  children: ReactNode;
}
export interface LightboxItemsProps<T> extends Omit<TabPanelsProps<T>, 'className'> {
  children: ReactNode[];
}
export interface LightboxItemProps extends Omit<TabPanelProps, 'className'> {}

export interface LightboxTrigger {
  children: ReactNode;
}

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
  width: 'full',
  height: 'full'
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
  order: 1,
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
    isSelected: {
      default: 'gray-800',
      isInModal: 'gray-100'
    }
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
  scrollBehavior: {
    default: 'smooth',
    '@media (prefers-reduced-motion: reduce)': 'auto'
  }
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
  scrollSnapStop: 'always',
  paddingX: 16,
  boxSizing: 'border-box'
});

interface LightboxCarouselContextProps {
  isInfinite?: boolean;
}

let LightBoxCarouselContext = createContext<LightboxCarouselContextProps>({});

export function LightboxCarousel(props: LightboxCarouselProps) {
  let ctx = useContext(LightboxTriggerContext);

  // Only render Lightbox Carousel inside a modal if there is a trigger
  if (ctx) {
    return (
      <ModalOverlay
        isOpen={ctx.isOpen}
        onOpenChange={ctx.setIsOpen}
        isDismissable
        className={renderProps =>
          style({
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'black/90',
            opacity: {
              default: 1,
              isEntering: 0,
              isExiting: 0
            },
            transition: 'opacity',
            transitionDuration: {
              default: 250,
              isExiting: 130
            }
          })(renderProps)
        }>
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
                  <RACTabs
                    {...props}
                    selectedKey={ctx?.activeKey}
                    onSelectionChange={ctx?.setActiveKey}
                    className={renderProps => carouselStyles(renderProps)}
                  />
                </LightBoxCarouselContext.Provider>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  return (
    <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}>
      <RACTabs {...props} className={renderProps => carouselStyles(renderProps)} />
    </LightBoxCarouselContext.Provider>
  );
}

export function LightboxPicker<T>(props: LightboxPickerProps<T>) {
  let ctx = useContext(LightboxTriggerContext);
  let state = useContext(TabListStateContext);
  let picker = <RACTabList {...props} className={renderProps => pickerStyles(renderProps)} />;

  // Wait until tab state has initialized its focus target before running autofocus.
  return state?.selectionManager.focusedKey != null ? (
    <FocusScope autoFocus={ctx?.isOpen ?? false}>{picker}</FocusScope>
  ) : (
    picker
  );
}

const thumbnailStyles = style({
  width: 64,
  height: 64,
  objectFit: 'cover',
  borderRadius: 'lg',
  opacity: 0.8
});

export function LightboxPickerItem(props: LightboxPickerItemProps) {
  let isInModal = useContext(LightboxTriggerContext);

  return (
    <RACTab {...props} className={renderProps => pickerItemStyles({...renderProps, isInModal})}>
      <ImageContext.Provider value={{styles: thumbnailStyles}}>
        {props.children}
      </ImageContext.Provider>
    </RACTab>
  );
}

export function LightboxItems<T>(props: LightboxItemsProps<T>) {
  let state = useContext(TabListStateContext)!;
  let {isInfinite} = useContext(LightBoxCarouselContext);

  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null ? state?.collection.getItem(selectedKey) : null;

  if (selectedItem == null) {
    return null;
  }

  let wrapper: ReactNode = isInfinite ? (
    <InfiniteLightboxItems>
      {index => props.children?.at(getWrappedIndex(index, state.collection.size))}
    </InfiniteLightboxItems>
  ) : (
    <FiniteLightboxItems>{index => props.children?.at(index)}</FiniteLightboxItems>
  );

  return (
    <div
      className={style({
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        maxHeight: 'fit',
        gap: 28
      })}>
      {wrapper}
    </div>
  );
}

interface FiniteLightboxItemsProps<T> extends Omit<LightboxItemsProps<T>, 'children'> {
  children: (page: number) => ReactNode;
}

function FiniteLightboxItems<T>(props: FiniteLightboxItemsProps<T>) {
  let {children: renderPage, ...otherProps} = props;
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);

  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null ? state?.collection.getItem(selectedKey) : null;

  let selectedIndex = selectedItem != null ? selectedItem.index : null;

  useLayoutEffect(() => {
    let el = ref.current;
    if (!el || selectedIndex == null) {
      return;
    }

    let currentIndex = Math.round(el.scrollLeft / el.offsetWidth);
    if (selectedIndex !== currentIndex) {
      // Jump directly because pages between distant selections may not be mounted.
      el.scrollTo({
        left: el.offsetWidth * selectedIndex,
        behavior: 'instant'
      });
    }
  }, [selectedIndex, selectedKey]);

  if (selectedIndex == null || state.collection.size === 0) {
    return null;
  }

  let size = state.collection.size;
  let pages = [selectedIndex - 1, selectedIndex, selectedIndex + 1].filter(
    page => page >= 0 && page < size
  );
  let leadingPages = Math.max(0, selectedIndex - 1);
  let trailingPages = Math.max(0, size - selectedIndex - 2);

  let prevItem = () => {
    let el = ref.current;
    if (el && selectedIndex > 0) {
      el.scrollLeft = el.offsetWidth * (selectedIndex - 1);
    }
  };

  let nextItem = () => {
    let el = ref.current;
    if (el && selectedIndex < size - 1) {
      el.scrollLeft = el.offsetWidth * (selectedIndex + 1);
    }
  };

  let onScroll = () => {
    let el = ref.current;
    if (!el) {
      return;
    }

    let currentIndex = Math.max(0, Math.min(size - 1, Math.round(el.scrollLeft / el.offsetWidth)));
    if (selectedIndex !== currentIndex) {
      let key = [...state.collection].at(currentIndex)?.key;
      if (key != null) {
        state.setSelectedKey(key);
      }
    }
  };

  return (
    <>
      <CarouselNavButton onPress={prevItem} side="start" isDisabled={selectedIndex === 0} />
      <div ref={ref} {...otherProps} className={itemsStyles} onScroll={onScroll}>
        <div
          style={{
            width: leadingPages * 100 + '%',
            flexShrink: 0,
            contain: 'strict'
          }}
        />
        {pages.map(page => (
          <div
            key={page}
            inert={page !== selectedIndex}
            style={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              contain: page !== selectedIndex ? 'inline-size' : undefined,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}>
            {renderPage(page)}
          </div>
        ))}
        <div
          style={{
            width: trailingPages * 100 + '%',
            flexShrink: 0,
            contain: 'strict'
          }}
        />
      </div>
      <CarouselNavButton onPress={nextItem} side="end" isDisabled={selectedIndex === size - 1} />
    </>
  );
}

interface CarouselNavButtonProps extends Omit<ButtonProps, 'children'> {
  side?: 'start' | 'end';
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
  | {type: 'SCROLL'; page: number}
  | {type: 'SCROLL_END'}
  | {type: 'SET_CENTER_PAGE'; page: number};

const PAGES = 100;

function getWrappedIndex(index: number, size: number): number {
  return ((index % size) + size) % size;
}

function reducer(state: CarouselState, action: Action) {
  let {centerPage, currentPage} = state;
  switch (action.type) {
    case 'SET_CENTER_PAGE':
      return {centerPage: action.page, currentPage: PAGES};
    case 'SCROLL':
      if (action.page === currentPage) {
        return state;
      }
      return {centerPage, currentPage: action.page};
    case 'SCROLL_END':
      if (currentPage === PAGES) {
        return state;
      }
      return {
        centerPage: centerPage + currentPage - PAGES,
        currentPage: PAGES
      };
  }
}

const imageStyles = style({
  display: 'block',
  width: 'fit',
  height: 'full',
  objectFit: 'contain',
  borderRadius: 'lg',
  backgroundColor: 'transparent'
});

interface InfiniteLightboxItemsProps<T> extends Omit<LightboxItemsProps<T>, 'children'> {
  children: (page: number) => ReactNode;
}

function InfiniteLightboxItems<T>(props: InfiniteLightboxItemsProps<T>) {
  let {children: renderPage} = props;
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);

  let selectedKey = state?.selectedKey;
  let selectedItem = selectedKey != null ? state?.collection.getItem(selectedKey) : null;

  let selectedIndex = selectedItem != null ? selectedItem.index : null;

  let [{centerPage, currentPage}, dispatch] = useReducer(reducer, null, () => ({
    centerPage: selectedIndex ?? 0,
    currentPage: PAGES
  }));

  // if the selected tab changes (like if you were to click one), update the centered page
  if (
    selectedIndex != null &&
    currentPage === PAGES &&
    selectedIndex !== getWrappedIndex(centerPage, state.collection.size)
  ) {
    dispatch({
      type: 'SET_CENTER_PAGE',
      page: selectedIndex
    });
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

  if (selectedIndex == null || state.collection.size === 0) {
    return null;
  }

  let visiblePage = centerPage + currentPage - PAGES;
  let pages = [visiblePage - 1, visiblePage, visiblePage + 1];

  let prevItem = () => {
    if (!ref.current) {
      return;
    }

    ref.current!.scrollLeft = ref.current!.offsetWidth * (PAGES - 1);
  };

  let nextItem = () => {
    if (!ref.current) {
      return;
    }

    ref.current!.scrollLeft = ref.current!.offsetWidth * (PAGES + 1);
  };

  // update selected tab while scrolling
  let onScroll = () => {
    let el = ref.current;
    let index = el ? Math.round(el.scrollLeft / el.offsetWidth) : 0; // this is not the collection index, this is the pages index
    let collectionIndex = centerPage + index - PAGES; // this is the actual collection index
    if (currentPage !== index) {
      // actually update the selected key (so that the tabs actually reflect what is in the viewport)
      let key = [...state.collection].at(
        getWrappedIndex(collectionIndex, state.collection.size)
      )?.key;
      if (key != null) {
        state.setSelectedKey(key);
      }
      // keeps track of how much we have scrolled from the center page
      dispatch({
        type: 'SCROLL',
        page: index
      });
    }
  };

  let onScrollEnd = () => {
    // update the centered page once scrolling is done
    dispatch({type: 'SCROLL_END'});
  };

  return (
    <>
      <CarouselNavButton onPress={prevItem} side="start" />
      <div ref={ref} onScroll={onScroll} onScrollEnd={onScrollEnd} className={itemsStyles}>
        {/* Placeholder to hold space in the scroll width for more pages. */}
        <div
          style={{
            width: (currentPage - 1) * 100 + '%',
            flexShrink: 0,
            contain: 'strict'
          }}
        />
        {pages.map(page => (
          <div
            // Follow the page, not its position in the rendered window, so React keeps
            // the incoming Image mounted as it becomes centered instead of restarting its loading state.
            key={page}
            inert={page !== visiblePage}
            style={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              contain: page !== visiblePage ? 'inline-size' : undefined,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always'
            }}>
            {renderPage(page)}
          </div>
        ))}
        <div
          style={{
            width: (PAGES * 2 - currentPage - 1) * 100 + '%',
            flexShrink: 0,
            contain: 'strict'
          }}
        />
      </div>
      <CarouselNavButton onPress={nextItem} side="end" />
    </>
  );
}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} shouldForceMount className={renderProps => itemStyles(renderProps)}>
      {renderProps => (
        <ImageContext.Provider value={{styles: imageStyles}}>
          {typeof props.children === 'function' ? props.children(renderProps) : props.children}
        </ImageContext.Provider>
      )}
    </RACTabPanel>
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

export function LightboxTrigger(props: LightboxTrigger) {
  let [isOpen, setIsOpen] = useState<boolean>(false);
  let [activeKey, setActiveKey] = useState<Key | undefined>(undefined);

  let onAction = (key: Key) => {
    setActiveKey(key);
    setIsOpen(true);
  };

  return (
    <LightboxTriggerContext.Provider value={{isOpen, setIsOpen, onAction, activeKey, setActiveKey}}>
      <div {...props}>{props.children}</div>
    </LightboxTriggerContext.Provider>
  );
}
