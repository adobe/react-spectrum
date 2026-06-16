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

import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {Meta, StoryFn} from '@storybook/react';
import React, {useContext, useMemo, useRef, useState} from 'react';
import './styles.global.css';
import {Autocomplete} from 'react-aria-components/Autocomplete';
import {ChevronDown} from 'lucide-react';
import {Collection, ComboBox, ComboBoxStateContext} from 'react-aria-components';
import {ComboBoxItem, ComboBoxListBox} from 'vanilla-starter/ComboBox';
import {Direction, type TokenFieldSegment, TokenSegmentList} from '../src/TokenSegmentList';
import {FieldButton, Label} from 'vanilla-starter/Form';
import {Header, Menu, MenuItem, MenuSection} from 'vanilla-starter/Menu';
import {InputContext} from 'react-aria-components/Input';
import {Popover} from 'vanilla-starter/Popover';
import {positionToDOMRange, Token, TokenField} from '../src/TokenField';
import 'vanilla-starter/TagGroup.css';
import {Text} from 'react-aria-components/Text';
import {useSlottedContext} from 'react-aria-components/slots';

const events = ['onChange', 'onPaste', 'onSubmit', 'onFocus', 'onBlur', 'onFocusChange'];

export default {
  title: 'AI/TokenField',
  component: TokenField,
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  },
  args: {...getActionArgs(events)}
} as Meta<typeof TokenField>;

export type TokenFieldStory = StoryFn<typeof TokenField>;

class TokenizingSegmentList extends TokenSegmentList {
  tokenRegex: RegExp;

  constructor(tokens: TokenFieldSegment[], tokenRegex: RegExp) {
    super(tokens);
    this.tokenRegex = tokenRegex;
  }

  static tokenize(text: string, tokenRegex: RegExp): TokenSegmentList {
    let list = new this([], tokenRegex);
    let segments = list.tokenize(text);
    return new this(segments, tokenRegex);
  }

  createSegmentList(segments: TokenFieldSegment[]): TokenSegmentList {
    return new TokenizingSegmentList(segments, this.tokenRegex);
  }

  tokenize(text: string): TokenFieldSegment[] {
    if (text.length === 0) {
      return [{type: 'text', text}];
    }

    let tokenRegex = this.tokenRegex;
    tokenRegex.lastIndex = 0;

    let match: RegExpExecArray | null = null;
    let start = 0;
    let segments: TokenFieldSegment[] = [];
    while ((match = tokenRegex.exec(text))) {
      if (match.index > start) {
        segments.push({type: 'text', text: text.slice(start, match.index)});
      }
      segments.push({type: 'token', text: match[0]});
      start = match.index + match[0].length;
    }

    if (start < text.length) {
      segments.push({type: 'text', text: text.slice(start)});
    }

    return segments;
  }
}

export const AutoTokenize: TokenFieldStory = () => {
  return (
    <TokenField
      multiline
      defaultValue={TokenizingSegmentList.tokenize(
        'This example automatically tokenizes #hashtags and @usernames in the text.',
        /(?<=\s|^)[#@]\S+(?=\s)/g
      )}
      aria-label="Message">
      {segment => <Token>{segment.text}</Token>}
    </TokenField>
  );
};

export const Template: TokenFieldStory = () => {
  return (
    <TokenField
      multiline
      defaultValue={TokenizingSegmentList.tokenize(
        "Hello {{firstName}}, it's nice to meet you!",
        /(?<=\s|^)\{\{.+?\}\}/g
      )}
      aria-label="Message">
      {segment => <Token>{segment.text}</Token>}
    </TokenField>
  );
};

const usernames = [
  {username: 'alexmiller'},
  {username: 'sarahjones'},
  {username: 'davidkim'},
  {username: 'emmawatson'},
  {username: 'oliverliu'},
  {username: 'ellagreen'},
  {username: 'lucasbrown'},
  {username: 'amandarivera'},
  {username: 'masonlee'},
  {username: 'nataliasmith'},
  {username: 'benjamintaylor'},
  {username: 'zoewilson'},
  {username: 'henrywalker'},
  {username: 'madelineyoung'},
  {username: 'noahscott'},
  {username: 'lucygonzalez'},
  {username: 'jacobmartin'},
  {username: 'averymoore'},
  {username: 'loganmurphy'},
  {username: 'miahernandez'},
  {username: 'danieladair'},
  {username: 'sofiacox'},
  {username: 'jackharris'},
  {username: 'chloebaker'},
  {username: 'liamrodriguez'}
];
const slashCommands = [
  {
    command: 'gif',
    description: 'Insert a GIF'
  },
  {
    command: 'todo',
    description: 'Add a todo list item'
  },
  {
    command: 'mention',
    description: 'Mention a user with @username'
  },
  {
    command: 'date',
    description: 'Insert the current date'
  },
  {
    command: 'quote',
    description: 'Insert a quote block'
  }
];

type Item = {username: string} | {command: string; description: string};

export const WithAutocomplete: TokenFieldStory = () => {
  let inputRef = useRef(null);
  let [value, setValue] = useState(
    new TokenSegmentList([
      {type: 'text', text: 'This example has autocomplete for '},
      {type: 'token', text: '@usernames'},
      {type: 'text', text: ' and '},
      {type: 'token', text: '/commands'}
    ])
  );

  let [filterAnchor, filterValue] = useMemo(() => {
    let filterAnchor = value.findText(value.caretPosition, Direction.Backward, /(?<=^|\s)[@/]/);
    if (filterAnchor != null) {
      let filterValue = value.slice(filterAnchor, value.caretPosition).toString();
      return [filterAnchor, filterValue];
    }
    return [null, null];
  }, [value]);

  let items: Item[] = [];
  if (filterValue != null && filterValue.startsWith('/')) {
    items = slashCommands.filter(item => item.command.includes(filterValue.slice(1)));
  } else if (filterValue != null && filterValue.startsWith('@')) {
    items = usernames.filter(item => item.username.includes(filterValue.slice(1)));
  }

  return (
    <Autocomplete>
      <TokenField value={value} onChange={setValue} aria-label="Message" ref={inputRef}>
        {segment => <Token>{segment.text}</Token>}
      </TokenField>
      <Popover
        triggerRef={inputRef}
        isOpen={filterAnchor != null && items.length > 0}
        isNonModal
        hideArrow
        placement="bottom start"
        trigger="MenuTrigger"
        getTargetRect={target => {
          return positionToDOMRange(target, filterAnchor!).getBoundingClientRect();
        }}>
        <Menu items={items} dependencies={[filterAnchor]}>
          {item => (
            <MenuItem
              id={'username' in item ? item.username : item.command}
              onAction={() => {
                setValue(value =>
                  value.replaceRangeWithSegments(
                    filterAnchor!,
                    value.caretPosition,
                    [
                      {
                        type: 'token',
                        text: 'username' in item ? '@' + item.username : item.command
                      },
                      {type: 'text', text: ' '}
                    ],
                    false // Don't coalesce in undo/redo history.
                  )
                );
              }}>
              <Text slot="label">{'username' in item ? item.username : item.command}</Text>
              {'description' in item ? <Text slot="description">{item.description}</Text> : null}
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </Autocomplete>
  );
};

class TagFieldSegmentList extends TokenSegmentList {
  tokenize(text: string): TokenFieldSegment[] {
    let parts = text.split(/[, \n]/);

    let segments: TokenFieldSegment[] = parts.map((part, i) => {
      if (i === parts.length - 1 || part.length === 0) {
        return {type: 'text', text: part};
      }
      return {type: 'token', text: part};
    });

    if (parts.at(-1)?.length === 0) {
      segments.pop();
    }
    return segments;
  }

  toString(): string {
    return this.segments.map(seg => seg.text).join(', ');
  }
}

export const TagField: TokenFieldStory = () => {
  return (
    <TokenField
      defaultValue={
        new TagFieldSegmentList([
          {type: 'token', text: 'Architecture'},
          {type: 'token', text: 'Design'},
          {type: 'token', text: 'Development'},
          {type: 'token', text: 'Marketing'},
          {type: 'token', text: 'Sales'}
        ])
      }
      aria-label="Categories">
      {segment => <Token>{segment.text}</Token>}
    </TokenField>
  );
};

export const Search: TokenFieldStory = () => {
  let inputRef = useRef(null);
  let [value, setValue] = useState(
    new TokenSegmentList([{type: 'token', text: 'From: Alice Smith'}])
  );

  let last = value.segments.at(-1);
  let filterText = last?.type === 'text' ? last.text : null;
  let suggestions: {name: string; items: string[]}[] = [];
  if (filterText != null) {
    let users = usernames
      .filter(item => item.username.includes(filterText))
      .map(u => u.username)
      .slice(0, 5);
    if (users.length > 0) {
      if (
        !value.segments.some(
          segment => segment.type === 'token' && segment.text.startsWith('From: ')
        )
      ) {
        suggestions.push({
          name: 'From',
          items: users
        });
      }

      suggestions.push({
        name: 'To',
        items: users
      });
    }

    suggestions.push({
      name: 'Subject',
      items: [filterText]
    });
  }

  return (
    <Autocomplete>
      <TokenField ref={inputRef} value={value} onChange={setValue} aria-label="Search">
        {segment => <Token>{segment.text}</Token>}
      </TokenField>
      <Popover
        triggerRef={inputRef}
        isOpen={suggestions.length > 0}
        isNonModal
        hideArrow
        placement="bottom start"
        style={{width: 'var(--trigger-width)'}}
        trigger="MenuTrigger">
        <Menu items={suggestions}>
          {section => (
            <MenuSection>
              <Header>{section.name}</Header>
              <Collection items={section.items}>
                {item => (
                  <MenuItem
                    id={section.name + '-' + item}
                    onAction={() => {
                      setValue(value =>
                        value.replaceRangeWithSegments(
                          {index: value.caretPosition.index, offset: 0},
                          value.caretPosition,
                          [{type: 'token', text: section.name + ': ' + item}],
                          false
                        )
                      );
                    }}>
                    {item}
                  </MenuItem>
                )}
              </Collection>
            </MenuSection>
          )}
        </Menu>
      </Popover>
    </Autocomplete>
  );
};

export const ComboBoxExample: TokenFieldStory = () => {
  return (
    <ComboBox selectionMode="multiple" style={{width: 500}}>
      <Label>Users</Label>
      <div className="combobox-field">
        <ComboBoxTagInput />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </div>
      <Popover hideArrow className="combobox-popover">
        <ComboBoxListBox items={usernames}>
          {state => <ComboBoxItem>{state.username}</ComboBoxItem>}
        </ComboBoxListBox>
      </Popover>
    </ComboBox>
  );
};

function ComboBoxTagInput() {
  let state = useContext(ComboBoxStateContext);
  let inputCtx = useSlottedContext(InputContext);
  let [value, setValue] = useState(() => {
    let selectedItems: TokenFieldSegment[] =
      state?.selectedItems.map(item => ({
        type: 'token' as const,
        text: item.textValue,
        value: item.value
      })) ?? [];
    selectedItems.push({type: 'text', text: state?.inputValue ?? ''});
    return new TokenSegmentList(selectedItems);
  });

  let [lastSelectedItems, setLastSelectedItems] = useState(state?.selectedItems || []);
  let [lastInputValue, setLastInputValue] = useState(state?.inputValue ?? '');

  if (
    state &&
    (state?.selectedItems !== lastSelectedItems || lastInputValue !== state?.inputValue)
  ) {
    setValue(value => {
      let selected = state?.selectedItems ?? [];
      let selectedValues = new Set(selected.map(item => item.value));

      let segments = value.segments.filter(
        seg => seg.type === 'text' || selectedValues.has(seg.value)
      );

      let existingValues = new Set(
        segments.filter(seg => seg.type === 'token').map(seg => seg.value)
      );

      let newTokens: TokenFieldSegment[] = selected
        .filter(item => !existingValues.has(item.value))
        .map(item => ({
          type: 'token' as const,
          text: item.textValue,
          value: item.value
        }));

      let caret = value.caretPosition;
      let removedBeforeCaret = 0;
      for (let i = 0; i < caret.index && i < value.segments.length; i++) {
        let seg = value.segments[i];
        if (seg.type === 'token' && !selectedValues.has(seg.value)) {
          removedBeforeCaret++;
        }
      }

      let insertIndex = Math.min(caret.index - removedBeforeCaret, segments.length);
      segments.splice(insertIndex, 0, ...newTokens);

      if (!segments.some(seg => seg.type === 'text')) {
        segments.push({type: 'text', text: state?.inputValue ?? ''});
      }

      let caretIndex = Math.min(insertIndex + newTokens.length, segments.length - 1);
      if (segments[caretIndex]?.type === 'text') {
        segments[caretIndex] = {type: 'text', text: state?.inputValue ?? ''};
      }

      let caretPosition = {
        index: caretIndex,
        offset:
          segments[caretIndex]?.type === 'text' ? (state?.inputValue ?? '').length : caret.offset
      };

      return new TokenSegmentList(segments, {caretPosition});
    });
    setLastSelectedItems(state?.selectedItems || []);
    setLastInputValue(state?.inputValue ?? '');
  }

  return (
    <TokenField
      {...(inputCtx as any)}
      defaultValue={undefined}
      value={value}
      onChange={list => {
        let segment = list.segments[list.caretPosition.index];
        state?.setInputValue(segment?.type === 'text' ? segment.text : '');
        setValue(list);
      }}
      aria-label="Users"
      style={{paddingInlineEnd: 36}}>
      {segment => <Token>{segment.text}</Token>}
    </TokenField>
  );
}
