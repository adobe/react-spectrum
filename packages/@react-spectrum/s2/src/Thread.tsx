/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {DOMRef, forwardRefType} from '@react-types/shared';
import {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import {GridList, GridListProps} from 'react-aria-components/GridList';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';

interface ThreadProps<T extends object> extends Pick<GridListProps<T>, 'items' | 'children'> {
  /** Returns the announcement text for an item when it is added to the thread. */
  getItemText?: (item: T) => string;
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
  let {children, items} = props;
  let domRef = useDOMRef(ref);
  let isNearBottomRef = useRef(true);
  let [showScrollButton, setShowScrollButton] = useState(false);
  let seenKeysRef = useRef<Set<unknown> | null>(null);

  useEffect(() => {
    if (!items) {
      return;
    }
    if (seenKeysRef.current === null) {
      // make sure we don't announce items that are already in the thread, user can navigate though the thread
      // ideally we would have access to the internal state or something so that we could access the keys/id tied to the
      // collection items
      seenKeysRef.current = new Set([...items]);
      return;
    }

    if (!getItemText) {
      return;
    }

    for (let item of items) {
      if (!seenKeysRef.current.has(item)) {
        seenKeysRef.current.add(item);
        announce(getItemText(item), 'polite');
      }
    }
  }, [items, getItemText]);

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
  );
});
