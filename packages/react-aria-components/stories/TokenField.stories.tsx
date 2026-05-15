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

import {Meta, StoryFn} from '@storybook/react';
import React, {useMemo, useRef, useState} from 'react';
import './styles.css';
import styles from '../example/index.css';
import {TokenField, type TokenFieldSegment} from '../src/TokenField';
import {Autocomplete} from '../src/Autocomplete';
import {Popover} from '../src/Popover';
import {Menu} from '../src/Menu';
import {MyMenuItem} from './utils';
import {flushSync} from 'react-dom';
import {TokenSegmentList} from '../src/TokenSegmentList';

export default {
  title: 'React Aria Components/TokenField',
  component: TokenField
} as Meta<typeof TokenField>;

export type TokenFieldStory = StoryFn<typeof TokenField>;

const sample = new TokenSegmentList([
  {type: 'token', text: 'Hello'},
  {type: 'text', text: ' tokens testing '},
  {type: 'token', text: 'World'},
  {type: 'text', text: ' test'}
]);

const mentionTokenRegex = /(?<=\s|^)@\S+(?=\s)/g;

export const TokenFieldExample: TokenFieldStory = () => {
  return <TokenField defaultValue={sample} aria-label="Message" tokenRegex={mentionTokenRegex} />;
};

const usernames = [
  {id: 1, username: 'alexmiller'},
  {id: 2, username: 'sarahjones'},
  {id: 3, username: 'davidkim'},
  {id: 4, username: 'emmawatson'},
  {id: 5, username: 'oliverliu'},
  {id: 6, username: 'ellagreen'},
  {id: 7, username: 'lucasbrown'},
  {id: 8, username: 'amandarivera'},
  {id: 9, username: 'masonlee'},
  {id: 10, username: 'nataliasmith'},
  {id: 11, username: 'benjamintaylor'},
  {id: 12, username: 'zoewilson'},
  {id: 13, username: 'henrywalker'},
  {id: 14, username: 'madelineyoung'},
  {id: 15, username: 'noahscott'},
  {id: 16, username: 'lucygonzalez'},
  {id: 17, username: 'jacobmartin'},
  {id: 18, username: 'averymoore'},
  {id: 19, username: 'loganmurphy'},
  {id: 20, username: 'miahernandez'},
  {id: 21, username: 'danieladair'},
  {id: 22, username: 'sofiacox'},
  {id: 23, username: 'jackharris'},
  {id: 24, username: 'chloebaker'},
  {id: 25, username: 'liamrodriguez'}
];

export const WithPopover: TokenFieldStory = () => {
  let inputRef = useRef(null);
  let [value, setValue] = useState(sample);
  let filterAnchor = useMemo(() => {
    if (value.caretPosition != null) {
      let segment = value.segments[value.caretPosition.index];
      if (!segment) {
        return null;
      }
      let filterAnchor = value.caretPosition.offset;
      while (filterAnchor >= 0) {
        if (segment.text[filterAnchor] === '@') {
          break;
        }
        filterAnchor--;
      }
      return {index: value.caretPosition.index, offset: filterAnchor};
    }
    return null;
  }, [value]);
  let filterValue = useMemo(() => {
    if (filterAnchor != null && value.caretPosition != null) {
      let segment = value.segments[value.caretPosition.index];
      if (
        filterAnchor.offset === 0 ||
        (filterAnchor.offset > 0 && segment.text[filterAnchor.offset - 1] === ' ')
      ) {
        return segment.text.slice(filterAnchor.offset + 1, value.caretPosition.offset);
      }
    }
    return null;
  }, [filterAnchor, value]);

  let items =
    filterValue == null ? [] : usernames.filter(emoji => emoji.username.includes(filterValue));
  return (
    <Autocomplete>
      <div>
        <TokenField value={value} onChange={setValue} aria-label="Message" ref={inputRef} />
        <Popover
          triggerRef={inputRef}
          isOpen={filterAnchor != null && items.length > 0}
          isNonModal
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 5
          }}>
          <Menu className={styles.menu} items={items} dependencies={[filterAnchor]}>
            {item => (
              <MyMenuItem
                onAction={() => {
                  setValue(value =>
                    value.replaceRangeWithSegments(
                      filterAnchor!,
                      value.caretPosition,
                      [
                        {type: 'token', text: '@' + item.username},
                        {type: 'text', text: ' '}
                      ],
                      false // Don't coalesce in undo/redo history.
                    )
                  );
                }}>
                {item.username}
              </MyMenuItem>
            )}
          </Menu>
        </Popover>
      </div>
    </Autocomplete>
  );
};
