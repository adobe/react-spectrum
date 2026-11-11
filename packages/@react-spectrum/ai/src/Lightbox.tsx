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

import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button, ButtonProps, ButtonRenderProps} from 'react-aria-components/Button';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
import {createContext, ReactNode, useContext, useEffect, useReducer, useRef, useState} from 'react';
import {Dialog, Modal, ModalOverlay} from 'react-aria-components/Modal';
import {FocusableElement, Key} from '@react-types/shared';
import {FocusScope} from 'react-aria/FocusScope';
import {focusWithoutScrolling} from 'react-aria/private/utils/focusWithoutScrolling';
import {
  getActiveElement,
  getEventTarget,
  nodeContains
} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {getFocusableTreeWalker} from 'react-aria/private/focus/FocusScope';
import {ImageContext} from '@react-spectrum/s2/Image';
import intlMessages from '../intl/*.json';
import type {KeyboardEvent} from 'react';
import {pressScale} from '@react-spectrum/s2/pressScale';
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
import {scrollFade} from './style/style-macro' with {type: 'macro'};
import {scrollIntoView} from 'react-aria/private/utils/scrollIntoView';
import {useKeyboard} from 'react-aria/useKeyboard';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {composeStepRunners} from 'storybook/internal/preview-api';

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
  // TODO: update max width based on device width?
  maxWidth: 300,
  overflowX: 'auto',
  flexDirection: {
    orientation: {
      horizontal: 'row',
      vertical: 'column'
    }
  },
  scrollbarWidth: 'none',
  flexShrink: 0,
  order: 1,
  gap: 4,
  boxSizing: 'border-box',
  padding: 4,
  scrollPadding: 4
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
  order: 1,
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
  display: 'flex',
  containerType: 'size',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  minHeight: 0,
  width: 'full',
  height: 'full',
  flexShrink: 0,
  // scrollSnapAlign: 'start',
  // scrollSnapStop: 'always',
  paddingX: 16,
  paddingY: 4,
  boxSizing: 'border-box',
  outlineStyle: 'none'
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
                <CloseButton
                  staticColor="white"
                  onPress={close}
                  styles={style({justifySelf: 'end'})}
                />
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
  let ref = useRef<HTMLDivElement | null>(null);
  let previousSelectedKey = useRef<Key | null>(null);
  let selectedKey = state?.selectedKey;
  let manager = state?.selectionManager;
  let focusedKey = manager?.focusedKey;

  useLayoutEffect(() => {
    let tabList = ref.current;
    if (!tabList || selectedKey == null || !manager) {
      return;
    }

    if (previousSelectedKey.current == null) {
      if (focusedKey != null) {
        previousSelectedKey.current = selectedKey;
      }
      return;
    }

    if (previousSelectedKey.current === selectedKey) {
      return;
    }

    let selectedTab = tabList.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!selectedTab) {
      return;
    }

    previousSelectedKey.current = selectedKey;
    if (
      manager.isFocused &&
      focusedKey !== selectedKey &&
      nodeContains(tabList, getActiveElement(tabList.ownerDocument))
    ) {
      manager.setFocusedKey(selectedKey);
    }

    scrollIntoView(tabList, selectedTab);
  }, [selectedKey, focusedKey, manager]);

  let picker = (
    <div className={style({display: 'flex', justifyContent: 'center', order: 1})}>
      <RACTabList
        {...props}
        ref={ref}
        className={renderProps => pickerStyles(renderProps) + ' ' + scrollFade({x: 16})}
      />
    </div>
  );

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
  borderRadius: 'default',
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

  if (state?.selectedItem == null) {
    return null;
  }

  let wrapper: ReactNode = isInfinite ? (
    <InfiniteLightboxItems>
      {index => props.children?.at(getWrappedIndex(index, state.collection.size))}
    </InfiniteLightboxItems>
  ) : (
    <FocusScope>
      <FiniteLightboxItems>{index => props.children?.at(index)}</FiniteLightboxItems>
    </FocusScope>
  );

  return (
    <div
      className={style({
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
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
  let shouldMoveFocusOnScroll = useRef(false);
  let isScrollingToSelection = useRef(false);
  let previousSelectedIndex = useRef<number | null>(null);
  let keyboardIntentTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let pendingFocus = useRef(false);

  let selectedKey = state?.selectedKey;
  let selectedIndex = state?.selectedItem?.index ?? null;

  useEffect(() => {
    return () => {
      if (keyboardIntentTimeout.current !== null) {
        clearTimeout(keyboardIntentTimeout.current);
        keyboardIntentTimeout.current = null;
      }
    };
  }, []);

  // Update scroll position based on selected key
  useLayoutEffect(() => {
    let el = ref.current;
    if (!el || selectedIndex == null) {
      return;
    }

    let previousIndex = previousSelectedIndex.current;
    previousSelectedIndex.current = selectedIndex;
    if (selectedIndex === previousIndex) {
      return;
    }

    let currentIndex = Math.round(el.scrollLeft / el.offsetWidth);
    // Retarget an existing selection-driven animation even if its intermediate
    // position already rounds to the newly selected page.
    // if (selectedIndex === currentIndex && !isScrollingToSelection.current) {
    //   return;
    // }

    let left = el.offsetWidth * selectedIndex;
    let isAdjacent = previousIndex !== null && Math.abs(selectedIndex - previousIndex) === 1;

    // Keep the chosen selection authoritative while the viewport catches up.
    isScrollingToSelection.current = el.scrollLeft !== left;

    // Distant selections may have unmounted pages between them.
    el.scrollTo({
      left,
      behavior: isAdjacent ? 'smooth' : 'instant'
    });
  }, [selectedIndex]);

  // Update focus to the new slide if we were focused on the tab panel to begin with
  useLayoutEffect(() => {
    if (!pendingFocus.current) {
      return;
    }

    pendingFocus.current = false;
    let el = ref.current;
    if (!el || selectedIndex == null) {
      return;
    }

    let activeElement = getActiveElement(el.ownerDocument);
    if (activeElement && activeElement !== el.ownerDocument.body) {
      return;
    }

    // Once the new slide is active, focus its first tabbable control or the panel.
    let panel = el.querySelector<HTMLElement>('[role="tabpanel"]');
    if (panel) {
      let walker = getFocusableTreeWalker(panel, {tabbable: true});
      let control = walker.nextNode() as FocusableElement | null;
      // Don't let focusing the incoming content initiate a competing scroll.
      focusWithoutScrolling(control ?? panel);
    }
  }, [selectedIndex, selectedKey]);

  let size = state.collection.size;

  let selectPageFromButton = (index: number) => {
    if (index < 0 || index >= size) {
      return;
    }

    let key = [...state.collection].at(index)?.key;
    if (key != null && key !== selectedKey) {
      state.setSelectedKey(key);
    }
  };

  let prepareFocusForSelectionChange = (el: HTMLElement, moveFocus: boolean) => {
    let panel = el.querySelector<HTMLElement>('[role="tabpanel"]');
    let activeElement = getActiveElement(el.ownerDocument);
    if (
      activeElement &&
      nodeContains(panel, activeElement) &&
      'blur' in activeElement &&
      typeof activeElement.blur === 'function'
    ) {
      pendingFocus.current = moveFocus;
      // Blur before deselection removes the panel's focus handlers.
      activeElement.blur();
    }
  };

  let updateSelectionFromScroll = () => {
    let el = ref.current;
    if (!el) {
      return;
    }

    let currentIndex = Math.max(0, Math.min(size - 1, Math.round(el.scrollLeft / el.offsetWidth)));
    let key = [...state.collection].at(currentIndex)?.key;
    if (key == null || key === selectedKey) {
      return;
    }

    prepareFocusForSelectionChange(el, shouldMoveFocusOnScroll.current);
    state.setSelectedKey(key);
  };

  let clearKeyboardIntent = () => {
    if (keyboardIntentTimeout.current !== null) {
      clearTimeout(keyboardIntentTimeout.current);
      keyboardIntentTimeout.current = null;
    }
  };

  // Native keyboard scrolling transfers focus as soon as the selected page changes.
  let onScroll = () => {
    // If scrolling was triggered by left/right arrow keys inside tab panel
    if (keyboardIntentTimeout.current !== null) {
      clearKeyboardIntent();
      shouldMoveFocusOnScroll.current = true;
    }

    // If we are scrolling to the selectedKey, we don't need to update selection since that has already been done
    if (isScrollingToSelection.current) {
      return;
    }

    // If we are swiping between slides, then we update the selected key based on scroll position. Otherwise, we generally use selectedKey as source of truth
    updateSelectionFromScroll();
  };

  let onScrollEnd = () => {
    let el = ref.current;
    // Rapid arrow presses on a tab panel can make Safari fire scrollend before the
    // latest scroll finishes. Keep scroll-driven selection suppressed until the viewport
    // maps to selectedIndex, so intermediate scroll events cannot overwrite selectedKey.
    if (
      isScrollingToSelection.current &&
      el &&
      selectedIndex != null &&
      Math.round(el.scrollLeft / el.offsetWidth) !== selectedIndex
    ) {
      return;
    }

    shouldMoveFocusOnScroll.current = false;
    isScrollingToSelection.current = false;
  };

  // Only handle arrows from the panel itself, preserving keyboard behavior
  // in text fields and other child controls.
  let handleArrow = (e: KeyboardEvent, delta: -1 | 1) => {
    clearKeyboardIntent();

    if (e.isDefaultPrevented()) {
      return false;
    }

    let panel = ref.current?.querySelector('[role="tabpanel"]');
    if (getEventTarget(e) !== panel) {
      // Clear the ref if the panel does not scroll
      keyboardIntentTimeout.current = setTimeout(() => {
        keyboardIntentTimeout.current = null;
      }, 100);

      return false;
    }

    if (selectedIndex == null) {
      return;
    }

    let nextIndex = selectedIndex + delta;
    if (nextIndex < 0 || nextIndex >= size) {
      return;
    }

    let key = [...state.collection].at(nextIndex)?.key;
    if (key != null) {
      // Selection drives the animation, so repeated arrows use the latest destination.
      shouldMoveFocusOnScroll.current = false;
      let el = ref.current;
      if (!el || key === selectedKey) {
        return;
      }

      prepareFocusForSelectionChange(el, true);
      state.setSelectedKey(key);
    }
  };

  let {keyboardProps} = useKeyboard({
    allowRepeats: true,
    shortcuts: {
      ArrowLeft: e => handleArrow(e, -1),
      ArrowRight: e => handleArrow(e, 1)
    }
  });

  if (selectedIndex == null || size === 0) {
    return null;
  }

  let pages = [selectedIndex - 1, selectedIndex, selectedIndex + 1].filter(
    page => page >= 0 && page < size
  );
  let leadingPages = Math.max(0, selectedIndex - 1);
  let trailingPages = Math.max(0, size - selectedIndex - 2);

  // TODO: are there actually otherProps, should i just mergeProps?
  return (
    <>
      <div
        ref={ref}
        {...otherProps}
        {...keyboardProps}
        className={itemsStyles}
        onScroll={onScroll}
        onScrollEnd={onScrollEnd}>
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
      <CarouselNavButton
        onPress={() => {
          selectPageFromButton(selectedIndex - 1);
        }}
        side="start"
        aria-disabled={selectedIndex === 0}
      />
      <CarouselNavButton
        onPress={() => {
          selectPageFromButton(selectedIndex + 1);
        }}
        side="end"
        aria-disabled={selectedIndex === size - 1}
      />
    </>
  );
}

interface CarouselNavButtonProps extends Omit<ButtonProps, 'children'> {
  side?: 'start' | 'end';
}

const carouselNavButtonStyles = style<
  ButtonRenderProps & {isInModal: boolean; side?: 'start' | 'end'}
>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: 32,
  flexShrink: 0,
  padding: 0,
  borderRadius: 'full',
  borderStyle: 'none',
  transition: 'default',
  backgroundColor: {
    default: baseColor('gray-100'),
    isDisabled: 'disabled',
    isInModal: {
      default: 'white/10',
      isHovered: 'white/20',
      isPressed: 'white/20',
      isFocusVisible: 'white/20',
      isDisabled: 'white/10'
    },
    forcedColors: {
      default: 'ButtonText',
      isHovered: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    isInModal: {
      default: 'white',
      isDisabled: 'white/40'
    },
    forcedColors: {
      default: 'ButtonFace',
      isDisabled: 'HighlightText'
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  outlineColor: {
    default: 'focus-ring',
    isInModal: 'white',
    forcedColors: 'Highlight'
  },
  forcedColorAdjust: 'none',
  disableTapHighlight: true,
  order: {
    default: 2,
    side: {
      start: 0
    }
  }
});

function CarouselNavButton(props: CarouselNavButtonProps) {
  let {side, ...otherProps} = props;
  let isInModal = useContext(LightboxTriggerContext) != null;
  let isDisabled = props['aria-disabled'] === true || props['aria-disabled'] === 'true';
  let ref = useRef<HTMLButtonElement | null>(null);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let Icon = side === 'start' ? ChevronLeft : ChevronRight;
  // oxlint-disable react/react-compiler
  return (
    <Button
      {...otherProps}
      ref={ref}
      onPress={isDisabled ? undefined : props.onPress}
      style={pressScale(ref, {})}
      className={renderProps =>
        carouselNavButtonStyles({...renderProps, side, isInModal, isDisabled})
      }
      aria-label={stringFormatter.format(
        side === 'start' ? 'attachmentlist.previousAttachments' : 'attachmentlist.nextAttachments'
      )}>
      <Icon />
    </Button>
  );
  // oxlint-enable react/react-compiler
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
  ...focusRing(),
  borderRadius: 'lg',
  display: 'block',
  width: 'fit',
  height: 'fit',
  flexShrink: 0,
  objectFit: 'contain',
  backgroundColor: 'transparent'
});

const innerImageStyles = style({
  width: 'auto',
  height: 'auto',
  maxWidth: '100cqw',
  maxHeight: '100cqh'
});

interface InfiniteLightboxItemsProps<T> extends Omit<LightboxItemsProps<T>, 'children'> {
  children: (page: number) => ReactNode;
}

function InfiniteLightboxItems<T>(props: InfiniteLightboxItemsProps<T>) {
  let {children: renderPage} = props;
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);

  let selectedIndex = state?.selectedItem?.index ?? null;

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
    // Scroll events can arrive while the carousel is hidden.
    if (!el || el.offsetWidth === 0) {
      return;
    }

    let index = Math.round(el.scrollLeft / el.offsetWidth); // this is not the collection index, this is the pages index
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
            // Keep each slide mounted when it moves to a new position.
            // Recreating S2 Image can make it flash, even if the image is already cached.
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
      <CarouselNavButton onPress={prevItem} side="start" />
      <CarouselNavButton onPress={nextItem} side="end" />
    </>
  );
}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} shouldForceMount className={itemStyles}>
      {renderProps => (
        <ImageContext.Provider
          value={{styles: imageStyles({...renderProps}), imgStyles: innerImageStyles}}>
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
