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
import {
  Children,
  isValidElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef
} from 'react';
import {CloseButton} from '@react-spectrum/s2/CloseButton';
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
import {LightboxTriggerContext} from './LightboxTrigger';
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
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export interface LightboxCarouselProps extends Omit<
  TabsProps,
  | 'className'
  | 'style'
  | 'render'
  | 'children'
  | 'orientation'
  | 'keyboardActivation'
  | 'isDisabled'
  | 'disabledKeys'
> {
  children: ReactNode;
  // TODO: Support infinite carousel
  // isInfinite?: boolean;
}

export interface LightboxPickerProps<T> extends Omit<
  TabListProps<T>,
  'className' | 'style' | 'render'
> {}
export interface LightboxPickerItemProps extends Omit<
  TabProps,
  'className' | 'style' | 'render' | 'children' | 'isDisabled'
> {
  children: ReactNode;
}
export interface LightboxItemsProps<T> extends Omit<
  TabPanelsProps<T>,
  'className' | 'style' | 'render' | 'children'
> {
  children: ReactNode;
}
export interface LightboxItemProps extends Omit<
  TabPanelProps,
  'className' | 'style' | 'render' | 'children' | 'shouldForceMount'
> {
  children: ReactNode;
}

const carouselStyles = style({
  display: 'flex',
  flexDirection: 'column',
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
  flexDirection: 'row',
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
  // Cap the stage at a 3:2 image (plus the item padding) so short, wide viewports
  // don't leave large empty gutters between the image and the nav buttons.
  maxWidth: 'calc((100cqh - 8px) * 3 / 2 + 24px)',
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

export function LightboxCarousel(props: LightboxCarouselProps) {
  let ctx = useContext(LightboxTriggerContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let {locale, direction} = useLocale();

  let modalRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        el.lang = locale;
        el.dir = direction;
      }
    },
    [locale, direction]
  );

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
        <Modal ref={modalRef} className={style({width: 'full', height: 'full'})}>
          <Dialog
            aria-label={props['aria-label'] ?? stringFormatter.format('lightbox.label')}
            className={style({
              position: 'relative',
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
                  styles={style({
                    position: 'absolute',
                    top: 24,
                    insetEnd: 24,
                    zIndex: 1
                  })}
                />
                <RACTabs
                  {...props}
                  selectedKey={ctx?.activeKey}
                  onSelectionChange={ctx?.setActiveKey}
                  className={carouselStyles}
                />
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  return (
    <div
      role="region"
      aria-label={props['aria-label']}
      aria-roledescription={stringFormatter.format('lightbox.carousel')}
      style={{width: '100%', height: '100%'}}>
      <RACTabs {...props} className={carouselStyles} />
    </div>
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
      <RACTabList {...props} ref={ref} className={pickerStyles + ' ' + scrollFade({x: 16})} />
    </div>
  );

  // Wait until tab state has initialized its focus target before running autofocus.
  if (ctx?.isOpen && focusedKey != null) {
    return <FocusScope autoFocus>{picker}</FocusScope>;
  }

  return picker;
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
  let slides = Children.toArray(props.children);
  let collection = state?.collection;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !collection || collection.size === 0) {
      return;
    }

    let slideIds = Children.toArray(props.children).map(slide =>
      isValidElement<LightboxItemProps>(slide) ? slide.props.id : undefined
    );
    let tabKeys = [...collection].map(item => item.key);
    if (slideIds.length !== tabKeys.length) {
      console.warn(
        `LightboxItems has ${slideIds.length} slides but LightboxPicker has ${tabKeys.length} items. They must match.`
      );
    }
    slideIds.forEach((id, i) => {
      if (i < tabKeys.length && id !== tabKeys[i]) {
        console.warn(
          `LightboxItem at position ${i} has id "${String(id)}" but the matching LightboxPickerItem has id "${String(tabKeys[i])}". Slides must be in the same order as picker items and use the same ids.`
        );
      }
    });
  }, [props.children, collection]);

  if (state?.selectedItem == null) {
    return null;
  }
  // TODO: Add InfiniteLightBoxItems to the wrapper when infinite carousel is supported
  let wrapper = (
    <FocusScope>
      <FiniteLightboxItems>{index => slides[index]}</FiniteLightboxItems>
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

function getScrollLeft(el: HTMLElement, index: number, isRTL: boolean) {
  return (isRTL ? -1 : 1) * index * el.offsetWidth;
}

function FiniteLightboxItems<T>(props: FiniteLightboxItemsProps<T>) {
  let {children: renderPage} = props;
  let state = useContext(TabListStateContext)!;
  let isRTL = useLocale().direction === 'rtl';
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

    let currentIndex = Math.round(Math.abs(el.scrollLeft) / el.offsetWidth);
    // Avoid fighting the user's scroll by returning early
    if (selectedIndex === currentIndex && !isProgrammaticScroll.current) {
      return;
    }

    let left = getScrollLeft(el, selectedIndex, isRTL);
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
      behavior: 'auto'
    });
  }, [selectedIndex, isRTL]);

  let size = state.collection.size;

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
    selectIndex(Math.round(Math.abs(el.scrollLeft) / el.offsetWidth));
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
      Math.round(Math.abs(el.scrollLeft) / el.offsetWidth) !== selectedIndex
    ) {
      return;
    }

    // When a jump interrupts a smooth scroll (i.e. going from the last tab to the first tab), Chrome adds the smooth scroll's last few pixels
    // after the jump and doesn't re-snap causing the slide to be incorrectly aligned.
    // https://issues.chromium.org/issues/40722572
    if (isProgrammaticScroll.current && el && selectedIndex != null) {
      el.scrollTo({left: getScrollLeft(el, selectedIndex, isRTL)});
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
      ArrowLeft: e => handleArrow(e, isRTL ? 1 : -1),
      ArrowRight: e => handleArrow(e, isRTL ? -1 : 1)
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

  return (
    <>
      <div
        ref={ref}
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

const smallTouchScreen = '@media (not ((hover: hover) and (pointer: fine))) and (width < 40rem)';

const carouselNavButtonStyles = style<
  ButtonRenderProps & {isInModal: boolean; side?: 'start' | 'end'}
>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: {
    default: 'static',
    [smallTouchScreen]: 'absolute'
  },
  size: {
    default: 32,
    [smallTouchScreen]: 1
  },
  overflow: {
    default: 'visible',
    [smallTouchScreen]: 'hidden'
  },
  opacity: {
    default: 1,
    [smallTouchScreen]: 0
  },
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
  let isRTL = useLocale().direction === 'rtl';
  let Icon = (side === 'start') !== isRTL ? ChevronLeft : ChevronRight;
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
      aria-label={stringFormatter.format(side === 'start' ? 'lightbox.previous' : 'lightbox.next')}>
      <Icon />
    </Button>
  );
  // oxlint-enable react/react-compiler
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

export function LightboxItem(props: LightboxItemProps) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  return (
    <RACTabPanel
      {...props}
      shouldForceMount
      className={itemStyles}
      aria-roledescription={stringFormatter.format('lightbox.slide')}>
      {renderProps => (
        <ImageContext.Provider
          value={{styles: imageStyles({...renderProps}), imgStyles: innerImageStyles}}>
          {props.children}
        </ImageContext.Provider>
      )}
    </RACTabPanel>
  );
}
