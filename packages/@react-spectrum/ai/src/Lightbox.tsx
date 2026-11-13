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
import {createContext, ReactNode, useContext, useReducer, useRef, useState} from 'react';
import {Dialog, Modal, ModalOverlay} from 'react-aria-components/Modal';
import {flushSync} from 'react-dom';
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

export interface LightboxCarouselProps extends Omit<TabsProps, 'className'> {
  // TODO: Support infinite carousel
  // isInfinite?: boolean;
}

export interface LightboxPickerProps<T> extends Omit<TabListProps<T>, 'className'> {}
export interface LightboxPickerItemProps extends Omit<TabProps, 'className' | 'children' | 'orientation'> {
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
  maxWidth: {
    default: 300,
    md: 600
  },
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
  gap: 8,
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
  colorScheme: {
    isInModal: 'light'
  },
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid',
    isSelected: 'solid'
  },
  outlineColor: {
    default: 'transparent',
    isSelected: {
      default: 'gray-800',
      isInModal: 'gray-100'
    },
    // Should we have a separate focus ring? That would mean a selected item would have one right indicating selection and another ring indicating focus
    isFocusVisible: 'focus-ring'
  },
  outlineWidth: 2,
  outlineOffset: 2
});

const itemsStyles = style({
  minWidth: 0,
  minHeight: 0,
  borderRadius: 'lg',
  width: 'full',
  height: 'full',
  // Cap the stage at a 16:9 image (plus the item padding) so short, wide viewports
  // don't leave large empty gutters between the image and the nav buttons.
  maxWidth: 'calc((100cqh - 8px) * 16 / 9 + 24px)',
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
  paddingX: 16,
  paddingY: 4,
  boxSizing: 'border-box',
  outlineStyle: 'none'
});

// interface LightboxCarouselContextProps {
//   isInfinite?: boolean;
// }

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
                {/* <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}> */}
                  <RACTabs
                    {...props}
                    selectedKey={ctx?.activeKey}
                    onSelectionChange={ctx?.setActiveKey}
                    className={renderProps => carouselStyles(renderProps)}
                  />
                {/* </LightBoxCarouselContext.Provider> */}
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  return (
    // <LightBoxCarouselContext.Provider value={{isInfinite: props.isInfinite}}>
      <div
        role="region"
        aria-label={props['aria-label']}
        aria-roledescription="slide"
        style={{width: '100%', height: '100%'}}>
        <RACTabs {...props} className={renderProps => carouselStyles(renderProps)} />
      </div>
    // </LightBoxCarouselContext.Provider>
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
  // let {isInfinite} = useContext(LightBoxCarouselContext);

  if (state?.selectedItem == null) {
    return null;
  }

  // let wrapper: ReactNode = isInfinite ? (
  //   <InfiniteLightboxItems>
  //     {index => props.children?.at(getWrappedIndex(index, state.collection.size))}
  //   </InfiniteLightboxItems>
  // ) : (
  //   <FocusScope>
  //     <FiniteLightboxItems>{index => props.children?.at(index)}</FiniteLightboxItems>
  //   </FocusScope>
  // );

  let wrapper = (
    <FocusScope>
      <FiniteLightboxItems>{index => props.children?.at(index)}</FiniteLightboxItems>
    </FocusScope>
  );
  
  return (
    <div
      className={style({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        containerType: 'size',
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        gap: 16
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
  let isProgrammaticScroll = useRef(false);
  let previousSelectedIndex = useRef<number | null>(null);

  let selectedKey = state?.selectedKey;
  let selectedIndex = state?.selectedItem?.index ?? null;

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
    // Avoid fighting the user's scroll by returning early
    if (selectedIndex === currentIndex && !isProgrammaticScroll.current) {
      return;
    }

    let left = el.offsetWidth * selectedIndex;
    let isAdjacent = previousIndex !== null && Math.abs(selectedIndex - previousIndex) === 1;

    // We're about to scroll to the selected slide. Flag it so onScroll doesn't switch the
    // selection back while the strip is still closer to the previous slide.
    isProgrammaticScroll.current = el.scrollLeft !== left;

    // Distant selections may have unmounted pages between them, so jump instead.
    // Also avoids distant selections from whipping through
    if (!isAdjacent) {
      // Briefly hiding overflow cancels a smooth scroll that's still running. Otherwise
      // Safari keeps animating after the jump and lands on the wrong slide.
      // Fixed in Safari 27, needed in Safari 26
      el.style.overflowX = 'hidden';
      el.scrollTo({left, behavior: 'instant'});
      el.style.overflowX = '';
      return;
    }

    el.scrollTo({
      left,
      // Safari ignores smooth scrolling after the scroll snap targets change. That means instead of adjacent slides smooth scrolling, they are instant.
      // This is fixed in Safari Tech Preview
      // https://bugs.webkit.org/show_bug.cgi?id=331157
      behavior: 'smooth'
    });
  }, [selectedIndex]);

  let size = state.collection.size;

  // Arrow keys, the nav buttons, and scrolling all change slides through here.
  let selectIndex = (index: number) => {
    let el = ref.current;
    if (!el || index < 0 || index >= size) {
      return;
    }

    let key = [...state.collection].at(index)?.key;
    if (key == null || key === selectedKey) {
      return;
    }

    let activeElement = getActiveElement(el.ownerDocument) as FocusableElement | null;
    if (!nodeContains(el.querySelector('[role="tabpanel"]'), activeElement)) {
      state.setSelectedKey(key);
      return;
    }

    // Focus is in the current slide, so move it to the new one.
    // Blur first: deselecting removes the panel's focus handlers.
    activeElement?.blur();
    // Re-render synchronously so the new slide is active before we focus it.
    flushSync(() => {
      state.setSelectedKey(key);
    });

    let panel = el.querySelector<HTMLElement>('[role="tabpanel"]');
    if (panel) {
      let walker = getFocusableTreeWalker(panel, {tabbable: true});
      let control = walker.nextNode() as FocusableElement | null;
      // Don't let focusing the incoming content initiate a competing scroll.
      focusWithoutScrolling(control ?? panel);
    }
  };

  let onScroll = () => {
    let el = ref.current;
    // If we tab, button, or arrow key, we've already updated the selectedKey so we don't need to update selection
    if (!el || isProgrammaticScroll.current) {
      return;
    }

    // If we are swiping between slides, then we update the selected key based on scroll position
    selectIndex(Math.round(el.scrollLeft / el.offsetWidth));
  };

  let onScrollEnd = () => {
    let el = ref.current;
    // Rapid arrow presses on a tab panel can make Safari fire scrollend before the
    // latest scroll finishes. Keep scroll-driven selection suppressed until the viewport
    // maps to selectedIndex, so intermediate scroll events cannot overwrite selectedKey.
    if (
      isProgrammaticScroll.current &&
      el &&
      selectedIndex != null &&
      Math.round(el.scrollLeft / el.offsetWidth) !== selectedIndex
    ) {
      return;
    }

    // When a jump interrupts a smooth scroll (i.e. going from the last tab to the first tab), Chrome adds the smooth scroll's last few pixels
    // after the jump and doesn't re-snap causing the slide to be incorrectly aligned. This stays on the selected slide, so it
    // can't change the selection.
    // https://issues.chromium.org/issues/40722572
    if (isProgrammaticScroll.current && el && selectedIndex != null) {
      el.scrollTo({left: selectedIndex * el.offsetWidth});
    }

    isProgrammaticScroll.current = false;
  };

  // Only handle arrows from the panel itself, preserving keyboard behavior in text fields and other child controls.
  let handleArrow = (e: KeyboardEvent, delta: -1 | 1) => {
    let panel = ref.current?.querySelector('[role="tabpanel"]');
    if (e.isDefaultPrevented() || getEventTarget(e) !== panel) {
      return false;
    }

    if (selectedIndex != null) {
      selectIndex(selectedIndex + delta);
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
        className={itemsStyles + ' ' + scrollFade({x: 16})}
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
          selectIndex(selectedIndex - 1);
        }}
        side="start"
        aria-disabled={selectedIndex === 0}
      />
      <CarouselNavButton
        onPress={() => {
          selectIndex(selectedIndex + 1);
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
  colorScheme: {
    isInModal: 'dark'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isDisabled: 'disabled',
    isInModal: {
      default: baseColor('gray-200'),
      isDisabled: 'gray-100'
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
      default: 'neutral',
      isDisabled: 'disabled'
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
    <RACTabPanel {...props} shouldForceMount className={itemStyles} aria-roledescription="slide">
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
