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

import {ActionButton} from './ActionButton';
import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import ChevronDown from '../s2wf-icons/S2_Icon_ChevronDown_20_N.svg';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {DOMRef, forwardRefType, RefObject} from '@react-types/shared';
import {
  GridList,
  GridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components/GridList';
import {nodeContains} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

const ThreadContext = createContext<(text: string) => void>(text => announce(text, 'polite'));

interface ThreadProps<T extends object> extends Pick<GridListProps<T>, 'items' | 'children'> {
  /** Ref to the Thread's associated prompt field. */
  fieldRef?: RefObject<HTMLElement | null>;
}

// TODO: things to look at
// chatgpt, claude, other AI assistants to see their UX
// they each don't seem to use column-reverse

// TODO: things to figure out/try
// tabbing is a bit broken as well since we hit the child elements of the gridlist rows in opposite order... This seems to be due to the
// tabIndex = 0 of the ToggleButtons in the ToggleButtonGroup
// also since we track the last focused key of the Gridlist, you get a experience where you might tab in, go to the input field to add some messages
// and tab back to the Gridlist but get returned to your last focused key instead of to the newest message
// maybe we could do something like force that the last item is the internal focusedKey, always updating this to the latest last child
// whenever items update AND focus is not within the gridlist

// TODO: things to handle later
// virtualizer layout
// weird behavior where the prompt field loses focus everytime you enter something
// make prompt field accept enter to submit the prompt, and have Option + Enter make a new line instead,  mimics
// other ai chat experiences

export const Thread = /*#__PURE__*/ (forwardRef as forwardRefType)(function Thread<
  T extends object
>(props: ThreadProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {children, items, fieldRef} = props;
  let domRef = useDOMRef(ref);
  let isNearBottomRef = useRef(true);
  let [showScrollButton, setShowScrollButton] = useState(false);

  let isGridListFocusedRef = useRef(false);
  let isFieldFocusedRef = useRef(false);
  let hasNewMessagesRef = useRef(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TODO gridlist doesn't have onfocus/onblur
  useEffect(() => {
    let el = domRef.current;
    if (!el) {
      return;
    }

    let onFocusIn = () => {
      isGridListFocusedRef.current = true;
    };

    let onFocusOut = (e: FocusEvent) => {
      if (!nodeContains(el, e.relatedTarget as Node)) {
        isGridListFocusedRef.current = false;
      }
    };

    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, [domRef]);

  // TODO: would like the structure to be more RAC like aka we pass these via context, but that would
  // require thread to also accept the prompt field as a child alongside the children for gridlist
  useEffect(() => {
    let field = fieldRef?.current;
    if (!field) {
      return;
    }

    let onFocusIn = () => {
      isFieldFocusedRef.current = true;
    };

    let onFocusOut = (e: FocusEvent) => {
      if (!nodeContains(field, e.relatedTarget as Node)) {
        isFieldFocusedRef.current = false;
      }
    };

    field.addEventListener('focusin', onFocusIn);
    field.addEventListener('focusout', onFocusOut);
    return () => {
      field.removeEventListener('focusin', onFocusIn);
      field.removeEventListener('focusout', onFocusOut);
    };
  }, [fieldRef]);

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

  useEffect(() => {
    return () => {
      if (timeout.current !== null) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  let handleScroll = useCallback(() => {
    if (!domRef.current) {
      return;
    }

    // because column reversed scrollTop=0 is the bottom and the scrollTop goes negative as you move up
    let nearBottom = domRef.current.scrollTop > -100;
    isNearBottomRef.current = nearBottom;
    setShowScrollButton(!nearBottom);
  }, [domRef]);

  useEffect(() => {
    // scrolls to bottom on first render cuz we initialize isNearBottomRef to true,
    // otherwise handles scrolling new prompts/etc into view unless you are scrolled up above
    // 100px
    // TODO: seems like other chat agents will scroll you down regardless of where you are in the chat
    // however, as it is streaming the response in, it will allow you to scroll where ever and not pull you back down
    if (isNearBottomRef.current) {
      requestAnimationFrame(() => {
        if (domRef.current) {
          domRef.current.scrollTop = 0;
        }
      });
    }
  }, [items, domRef]);

  let scrollToBottom = useCallback(() => {
    if (domRef.current) {
      domRef.current.scrollTo({top: 0, behavior: 'smooth'});
    }
  }, [domRef]);

  return (
    <ThreadContext.Provider value={announceItem}>
      <div
        className={style({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexGrow: 1
        })}>
        {/*
          TODO this is before the grid list so that a user tabbing in will hit this first
          so they can then scroll to bottom. Wonder if there should also be one after the grid list
          so that shift tabbing from the input keyboard works
        */}
        {showScrollButton && (
          <div
            className={style({
              position: 'absolute',
              bottom: 16,
              left: '50%'
            })}>
            <ActionButton aria-label="Scroll to bottom" onPress={scrollToBottom}>
              <ChevronDown />
            </ActionButton>
          </div>
        )}
        <GridList
          disallowTypeAhead
          onScroll={handleScroll}
          aria-label="Chat thread"
          keyboardNavigationBehavior="tab"
          focusOnEntry="first"
          items={items}
          ref={domRef}
          className={style({
            display: 'flex',
            flexDirection: 'column-reverse',
            rowGap: 16,
            alignItems: 'start',
            flexGrow: 1,
            overflow: 'auto',
            padding: 8,
            scrollPadding: 8
          })}>
          {children}
        </GridList>
      </div>
    </ThreadContext.Provider>
  );
});

interface ThreadItemProps extends Pick<GridListItemProps, 'className' | 'children' | 'textValue'> {
  isStreaming?: boolean;
  /** Announce textValue on mount even when isStreaming is provided. */
  shouldAnnounceOnMount?: boolean;
}

export function ThreadItem(props: ThreadItemProps) {
  let {className, children, textValue = ' ', isStreaming, shouldAnnounceOnMount} = props;
  let announceItem = useContext(ThreadContext);

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
