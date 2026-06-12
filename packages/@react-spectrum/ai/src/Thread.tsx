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
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import type {CSSProperties} from 'react';
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import {DOMRef, forwardRefType} from '@react-types/shared';
import {
  GridList,
  GridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components/GridList';
import {nodeContains} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {TextFieldContext} from 'react-aria-components/TextField';
import {useDOMRef} from './useDOMRef';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

interface InternalThreadContextValue {
  announceItem: (text: string) => void;
  setGridListFocused: (isFocused: boolean) => void;
  setIsNearBottom: (isNear: boolean) => void;
  setScrollElement: (element: HTMLElement | null) => void;
}

const InternalThreadContext = createContext<InternalThreadContextValue>({
  announceItem: text => announce(text, 'polite'),
  setGridListFocused: () => {},
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
export interface ThreadProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// TODO: tabbing is a bit broken as well since we hit the child elements of the gridlist rows in opposite order... This seems to be due to the
// tabIndex = 0 of the ToggleButtons in the ToggleButtonGroup
export const Thread = /*#__PURE__*/ (forwardRef as forwardRefType)(function Thread(
  props: ThreadProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, className, style} = props;
  let domRef = useDOMRef(ref);
  let isGridListFocusedRef = useRef(false);
  let isFieldFocusedRef = useRef(false);
  let hasNewMessagesRef = useRef(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  let scrollRef = useRef<HTMLElement | null>(null);
  let scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({top: 0, behavior: 'smooth'});
  }, []);
  let [isNearBottom, setIsNearBottom] = useState(true);

  // only announce new items if user is in the prompt field, otherwise if they
  // are in the thread only announce there are new responses. If not in thread, don't announce
  let announceItem = useCallback((text: string) => {
    if (isGridListFocusedRef.current) {
      // TODO: ideally announce number of new messages, but only count system messages? maybe threaditem needs
      // to have a "type" prop
      if (!hasNewMessagesRef.current) {
        hasNewMessagesRef.current = true;
        announce('New message', 'polite');
        // TODO: arbirary amount of time to wait before announcing new message, maybe we don't clear until
        // we detect they scroll down? Or maybe when we do the message count we do it after a certain number of messages?
        // or maybe this is fine
        timeout.current = setTimeout(() => {
          hasNewMessagesRef.current = false;
          timeout.current = null;
        }, 5000);
      }
      return;
    }

    if (isFieldFocusedRef.current) {
      announce(text, 'polite');
    }
  }, []);

  let setGridListFocused = useCallback((isFocused: boolean) => {
    isGridListFocusedRef.current = isFocused;
  }, []);

  let setScrollElement = useCallback((el: HTMLElement | null) => {
    scrollRef.current = el;
  }, []);

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
        [
          InternalThreadContext,
          {announceItem, setGridListFocused, setIsNearBottom, setScrollElement}
        ],
        [ThreadScrollButtonContext, {isNearBottom, scrollToBottom}],
        [
          TextFieldContext,
          {
            slots: {
              [DEFAULT_SLOT]: {},
              prompt: {
                onFocusChange: (focused: boolean) => {
                  isFieldFocusedRef.current = focused;
                }
              }
            }
          }
        ]
      ]}>
      <div ref={domRef} className={className} style={style}>
        {children}
      </div>
    </Provider>
  );
});

// TODO: update the items/className/children/etc type to reflect a thread specific classname once we finalize API
export interface ThreadListProps<T extends object> extends Pick<
  GridListProps<T>,
  'items' | 'children' | 'focusOnEntry' | 'aria-label' | 'aria-labelledby' | 'className'
> {}

export function ThreadList<T extends object>(props: ThreadListProps<T>) {
  let {
    items,
    children,
    className,
    focusOnEntry,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  let {setGridListFocused, setIsNearBottom, setScrollElement} = useContext(InternalThreadContext);
  let isNearBottomRef = useRef(true);
  let gridListRef = useRef<HTMLDivElement | null>(null);

  let callbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      gridListRef.current = el;
      setScrollElement(el);
    },
    [setScrollElement]
  );

  // TODO: gridlist doesn't have onFocus/onBlur
  useEffect(() => {
    let el = gridListRef.current;
    if (!el) {
      return;
    }

    let onFocusIn = () => setGridListFocused(true);
    let onFocusOut = (e: FocusEvent) => {
      if (!nodeContains(el, e.relatedTarget as Node)) {
        setGridListFocused(false);
      }
    };

    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [setGridListFocused]);

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
      focusOnEntry={focusOnEntry}
      items={items}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      // TODO: for now we enforce this, but to be configurable?
      style={{display: 'flex', flexDirection: 'column-reverse'}}
      className={className}>
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

  if (isNearBottom) {
    return null;
  }

  return (
    <ButtonContext.Provider
      value={{slots: {[DEFAULT_SLOT]: {}, scroll: {onPress: scrollToBottom}}}}>
      {children}
    </ButtonContext.Provider>
  );
}

// TODO: update the className type to reflect a thread specific classname once we finalize API
export interface ThreadItemProps extends Pick<
  GridListItemProps,
  'className' | 'children' | 'textValue'
> {
  /** Whether or not the item's content is currently being streamed in. */
  isStreaming?: boolean;
  /** Announce textValue on mount even when isStreaming is provided. */
  shouldAnnounceOnMount?: boolean;
}

export function ThreadItem(props: ThreadItemProps) {
  let {className, children, textValue = ' ', isStreaming, shouldAnnounceOnMount} = props;
  let {announceItem} = useContext(InternalThreadContext);

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
    <GridListItem textValue={textValue} className={className}>
      {children}
    </GridListItem>
  );
}
