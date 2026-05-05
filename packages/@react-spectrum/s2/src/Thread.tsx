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
import {forwardRef, ReactNode, useEffect} from 'react';
import {GridList} from 'react-aria-components/GridList';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';

interface ThreadProps {
  // TODO: should take specific children (UserMessage/etc), but those are to come
  children: ReactNode | ((item) => ReactNode)
};

// TODO: things to look at
// chatgpt, claude, other AI assistants to see their UX


// TODO: things to figure out/try
// scroll to bottom button
// announcements for new messages
// column reverse layout?
// add to story some kind of mock streaming


// TODO: things to handle later
export const Thread = /*#__PURE__*/ (forwardRef as forwardRefType)(function Thread(
  props: ThreadProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {children} = props;
  let domRef = useDOMRef(ref);

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
      ref={domRef}
      className={style({
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
