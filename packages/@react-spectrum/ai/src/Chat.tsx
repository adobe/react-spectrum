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

import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import {ButtonContext} from 'react-aria-components/Button';
import {
  createContext,
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import {DOMRef, forwardRefType} from '@react-types/shared';
import {focusRing, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  GridList,
  GridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components/GridList';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {useDOMRef} from './useDOMRef';
import {useEnterAnimation, useExitAnimation} from 'react-aria/private/utils/animation';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

const scrollButtonWrapper = style({
  opacity: {
    isEntering: 0,
    isExiting: 0
  },
  translateY: {
    isEntering: 4,
    isExiting: 4
  },
  transition: '[opacity, translate]',
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: 'in'
  },
  pointerEvents: {
    isExiting: 'none'
  }
});

export interface PromptFocusContextValue {
  onFocusChange: (isFocused: boolean) => void;
}

export const PromptFocusContext = createContext<PromptFocusContextValue>({
  onFocusChange: () => {}
});

interface InternalChatContextValue {
  announceItem: (text: string) => void;
  setIsNearBottom: (isNear: boolean) => void;
  setScrollElement: (element: HTMLElement | null) => void;
}

const InternalChatContext = createContext<InternalChatContextValue>({
  announceItem: text => announce(text, 'polite'),
  setIsNearBottom: () => {},
  setScrollElement: () => {}
});

interface ThreadScrollButtonContextValue {
  isNearBottom: boolean;
  scrollToBottom: () => void;
}

const ThreadScrollButtonContext = createContext<ThreadScrollButtonContextValue>({
  isNearBottom: true,
  scrollToBottom: () => {}
});

// TODO: make this more RAC like (aka default class name and other RAC prop)
export interface ChatProps {
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
  /**
   * Children of the chat, such as Thread, PromptField, and ThreadScrollButton.
   */
  children?: ReactNode;
}

export const Chat = /*#__PURE__*/ (forwardRef as forwardRefType)(function Chat(
  props: ChatProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, styles} = props;
  let domRef = useDOMRef(ref);
  let isFieldFocusedRef = useRef(false);
  let isChatFocusWithinRef = useRef(false);
  let hasNewMessagesRef = useRef(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  let scrollRef = useRef<HTMLElement | null>(null);
  let scrollToBottom = useCallback(() => {
    let el = scrollRef.current;
    if (!el) {
      return;
    }
    // TODO: will need some kind of api to programatically set the focused item to
    // the newest item in the gridlist in the virtualizer case. this works for
    // non-virtualized for now though
    el.addEventListener(
      'scrollend',
      () => {
        let firstRow = el.querySelector<HTMLElement>('[role="row"]');
        (firstRow ?? el).focus();
      },
      {once: true}
    );
    el.scrollTo({top: 0, behavior: 'smooth'});
  }, []);
  let [isNearBottom, setIsNearBottom] = useState(true);

  // only announce new items if user is in the prompt field, otherwise if they
  // are outside the field, only announce there are new responses. If not in chat at all, don't announce
  let announceItem = useCallback(
    (text: string) => {
      if (isFieldFocusedRef.current) {
        announce(text, 'polite');
        return;
      }

      if (isChatFocusWithinRef.current) {
        // TODO: ideally announce number of new messages, but only count system messages? maybe threaditem needs
        // to have a "type" prop
        if (!hasNewMessagesRef.current) {
          hasNewMessagesRef.current = true;
          announce(stringFormatter.format('chat.newMessage'), 'polite');
          // TODO: arbirary amount of time to wait before announcing new message, maybe we don't clear until
          // we detect they scroll down? Or maybe when we do the message count we do it after a certain number of messages?
          // or maybe this is fine
          timeout.current = setTimeout(() => {
            hasNewMessagesRef.current = false;
            timeout.current = null;
          }, 5000);
        }
      }
    },
    [stringFormatter]
  );

  let setScrollElement = useCallback((el: HTMLElement | null) => {
    scrollRef.current = el;
  }, []);

  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: isFocused => {
      isChatFocusWithinRef.current = isFocused;
    }
  });

  useEffect(() => {
    return () => {
      if (timeout.current !== null) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <Provider
      values={[
        [InternalChatContext, {announceItem, setIsNearBottom, setScrollElement}],
        [ThreadScrollButtonContext, {isNearBottom, scrollToBottom}],
        [
          PromptFocusContext,
          {
            onFocusChange: (focused: boolean) => {
              isFieldFocusedRef.current = focused;
            }
          }
        ]
      ]}>
      <div ref={domRef} className={styles} {...focusWithinProps}>
        {children}
      </div>
    </Provider>
  );
});

export interface ThreadProps<T extends object> extends Pick<
  GridListProps<T>,
  'items' | 'children' | 'UNSTABLE_focusOnEntry' | 'aria-label' | 'aria-labelledby'
> {
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

export function Thread<T extends object>(props: ThreadProps<T>) {
  let {
    items,
    children,
    styles,
    UNSTABLE_focusOnEntry,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  let {setIsNearBottom, setScrollElement} = useContext(InternalChatContext);
  let isNearBottomRef = useRef(true);
  let gridListRef = useRef<HTMLDivElement | null>(null);

  let callbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      gridListRef.current = el;
      setScrollElement(el);
    },
    [setScrollElement]
  );

  let handleScroll = useCallback(() => {
    let el = gridListRef.current;
    if (!el) {
      return;
    }

    // because column reversed scrollTop=0 is the bottom and the scrollTop goes negative as you move up
    let nearBottom = el.scrollTop > -100;
    isNearBottomRef.current = nearBottom;
    setIsNearBottom(nearBottom);
  }, [setIsNearBottom]);

  useEffect(() => {
    // scrolls to bottom on first render cuz we initialize isNearBottomRef to true,
    // otherwise handles scrolling new prompts/etc into view unless you are scrolled up above
    // 100px
    if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        if (gridListRef.current) {
          gridListRef.current.scrollTop = 0;
        }
      });
    }
  }, [items]);

  return (
    <GridList
      ref={callbackRef}
      disallowTypeAhead
      onScroll={handleScroll}
      keyboardNavigationBehavior="tab"
      UNSTABLE_focusOnEntry={UNSTABLE_focusOnEntry}
      items={items}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      // TODO: for now we enforce this, but to be configurable?
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        boxSizing: 'border-box',
        minWidth: 0
      }}
      className={styles}>
      {children}
    </GridList>
  );
}

export interface ThreadScrollButtonProps {
  children?: ReactNode;
}

// TODO: wrapper so we can do the "if isNearBottom then hide" logic, could do this via inline styles perhaps
// and ditch the wrapper?
export function ThreadScrollButton({children}: ThreadScrollButtonProps) {
  let {isNearBottom, scrollToBottom} = useContext(ThreadScrollButtonContext);
  let ref = useRef<HTMLDivElement>(null);
  let isVisible = !isNearBottom;
  let isExiting = useExitAnimation(ref, isVisible);

  if (!isVisible && !isExiting) {
    return null;
  }

  return (
    <ButtonContext.Provider
      value={{slots: {[DEFAULT_SLOT]: {}, scroll: {onPress: scrollToBottom}}}}>
      <ThreadScrollButtonInner domRef={ref} isExiting={isExiting}>
        {children}
      </ThreadScrollButtonInner>
    </ButtonContext.Provider>
  );
}

interface ThreadScrollButtonInnerProps {
  domRef: RefObject<HTMLDivElement | null>;
  isExiting: boolean;
  children?: ReactNode;
}

function ThreadScrollButtonInner({domRef, isExiting, children}: ThreadScrollButtonInnerProps) {
  let isEntering = useEnterAnimation(domRef);
  return (
    <div ref={domRef} className={scrollButtonWrapper({isEntering, isExiting})}>
      {children}
    </div>
  );
}

const threadItemBase = style({
  ...focusRing(),
  borderRadius: 'default'
});

export interface ThreadItemProps extends Pick<GridListItemProps, 'children' | 'textValue'> {
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
  /** Whether or not the item's content is currently being streamed in. */
  isStreaming?: boolean;
  /** Announce textValue on mount even when isStreaming is provided. */
  shouldAnnounceOnMount?: boolean;
}

export function ThreadItem(props: ThreadItemProps) {
  let {styles, children, textValue = ' ', isStreaming, shouldAnnounceOnMount} = props;
  let {announceItem} = useContext(InternalChatContext);

  // TODO: using aria-live on the gridlist item was pretty chatty and the streaming causes the text announcement
  // to constantly reset. If we used a live region and updated its contents when streaming finished that worked decently
  // but still feels quite verbose. Stick with this and get feedback
  useLayoutEffect(() => {
    if ((isStreaming === undefined || shouldAnnounceOnMount) && textValue && textValue !== ' ') {
      announceItem(textValue);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let isStreamingNow = isStreaming ?? false;
  let prevStreamingRef = useRef(isStreamingNow);
  useLayoutEffect(() => {
    if (isStreaming === undefined) {
      return;
    }
    let wasStreaming = prevStreamingRef.current;
    prevStreamingRef.current = isStreamingNow;
    if (wasStreaming && !isStreamingNow && textValue && textValue !== ' ') {
      announceItem(textValue);
    }
  }, [isStreaming, isStreamingNow, textValue, announceItem]);

  return (
    <GridListItem
      textValue={textValue}
      className={renderProps => mergeStyles(threadItemBase({...renderProps}), styles)}>
      {children}
    </GridListItem>
  );
}
