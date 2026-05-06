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

import {DOMRef, forwardRefType} from '@react-types/shared';
import {forwardRef, useEffect} from 'react';
import {GridList, GridListProps} from 'react-aria-components/GridList';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';

interface ThreadProps<T extends object> extends Pick<GridListProps<T>, 'items' | 'children'> {}

// TODO: things to look at
// chatgpt, claude, other AI assistants to see their UX
// they each don't seem to use column-reverse


// TODO: things to figure out/try
// scroll to bottom button
// announcements for new messages
// column reverse layout? is it a problem that the expectation becomes that the first item in the items
// array is now the most recent item in the stream? Also shift tabbing will move to the top of the list since that is the item
// closest to the prompt field

// add to story some kind of mock streaming
// fix the scroll to new content as it flows in, might be fixed by column reverse layout

// TODO: things to handle later
// virtualizer layout
// weird behavior where the prompt field loses focus everytime you enter something

export const Thread = /*#__PURE__*/ (forwardRef as forwardRefType)(function Thread<T extends object>(
  props: ThreadProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, items} = props;
  let domRef = useDOMRef(ref);

  // TODO: will need to do this whenever items changes
  useEffect(() => {
    requestAnimationFrame(() => {
      if (domRef.current) {
        domRef.current.scrollTop = domRef.current.scrollHeight;
      }
    });
  }, [domRef]);

  return (
    <GridList
      aria-label="Chat thread"
      keyboardNavigationBehavior="tab"
      items={items}
      ref={domRef}
      className={style({
        // flexDirection: 'column-reverse',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 16,
        alignItems: 'start',
        flexGrow: 1,
        overflow: 'auto',
        padding: 8,
        scrollPadding: 8
      })}>
      {children}
    </GridList>
  );
});
