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

import {act} from 'react';
import {defineTarget} from '../explorer.mjs';
import {Item} from '../../packages/react-stately/src/collections/Item';
import React, {useState} from 'react';
import {renderHook} from '@testing-library/react';
import {useComboBoxState} from '../../packages/react-stately/src/combobox/useComboBoxState';

const items = [
  {id: 'a', name: 'Apple'},
  {id: 'b', name: 'Banana'}
];
function useExample({controlled, loaded}: {controlled: boolean; loaded: boolean}) {
  let [key, setKey] = useState<any>(null);
  let [input, setInput] = useState('');
  let state = useComboBoxState({
    items: loaded ? items : [],
    children: item => <Item key={item.id}>{item.name}</Item>,
    defaultFilter: (text, value) => text.toLowerCase().includes(value.toLowerCase()),
    allowsCustomValue: false,
    ...(controlled
      ? {
          selectedKey: key,
          onSelectionChange: selected => {
            setKey(selected);
            setInput((loaded ? items : []).find(item => item.id === selected)?.name ?? '');
          },
          inputValue: input,
          onInputChange: setInput
        }
      : {})
  });
  return {state, setKey, setInput};
}
type Hook = ReturnType<
  typeof renderHook<ReturnType<typeof useExample>, {controlled: boolean; loaded: boolean}>
>;
interface Context {
  hook: Hook;
  controlled: boolean;
  loaded: boolean;
  history: string[];
  typingSafe: boolean;
  blurred: boolean;
}
const current = (ctx: Context) => ctx.hook.result.current.state;
const action = (name: string, run: (ctx: Context) => void, enabled = (_ctx: Context) => true) => ({
  enabled,
  async run(ctx: Context) {
    await act(async () => run(ctx));
    ctx.history.push(name);
    ctx.blurred = name === 'Blur';
  }
});
export default defineTarget<Context>({
  name: 'combobox',
  description:
    'Real ComboBox state with accepted controlled updates and asynchronous item arrival.',
  sources: ['packages/react-stately/src/combobox/useComboBoxState.ts'],
  bounds: {depth: 4},
  setup() {
    return {
      hook: renderHook<ReturnType<typeof useExample>, {controlled: boolean; loaded: boolean}>(
        useExample,
        {initialProps: {controlled: false, loaded: true}}
      ),
      controlled: false,
      loaded: true,
      history: [],
      typingSafe: true,
      blurred: false
    };
  },
  teardown: ctx => ctx.hook.unmount(),
  actions: {
    Focus: action(
      'Focus',
      ctx => current(ctx).setFocused(true),
      ctx => !current(ctx).isFocused
    ),
    Blur: action(
      'Blur',
      ctx => current(ctx).setFocused(false),
      ctx => current(ctx).isFocused
    ),
    Open: action(
      'Open',
      ctx => current(ctx).open(null, 'manual'),
      ctx => !current(ctx).isOpen
    ),
    Close: action(
      'Close',
      ctx => current(ctx).close(),
      ctx => current(ctx).isOpen
    ),
    Type: {
      enabled: ctx => current(ctx).isFocused,
      async run(ctx) {
        let before = current(ctx).selectedKey;
        await act(async () => current(ctx).setInputValue('Ban'));
        let after = current(ctx).selectedKey;
        ctx.typingSafe &&= after === null || after === before;
        ctx.history.push('Type');
        ctx.blurred = false;
      }
    },
    SelectA: action(
      'SelectA',
      ctx => current(ctx).setSelectedKey('a'),
      ctx => ctx.loaded && current(ctx).selectedKey !== 'a'
    ),
    SelectB: action(
      'SelectB',
      ctx => current(ctx).setSelectedKey('b'),
      ctx => ctx.loaded && current(ctx).selectedKey !== 'b'
    ),
    Controlled: action(
      'Controlled',
      ctx => {
        ctx.controlled = true;
        ctx.hook.rerender({controlled: true, loaded: ctx.loaded});
      },
      ctx => !ctx.controlled && ctx.history.length === 0
    ),
    ControlledSelection: action(
      'ControlledSelection',
      ctx => {
        ctx.hook.result.current.setKey('b');
        ctx.hook.result.current.setInput('Banana');
      },
      ctx => ctx.controlled
    ),
    LoadStart: action(
      'LoadStart',
      ctx => {
        ctx.loaded = false;
        ctx.hook.rerender({controlled: ctx.controlled, loaded: false});
      },
      ctx => ctx.loaded
    ),
    LoadComplete: action(
      'LoadComplete',
      ctx => {
        ctx.loaded = true;
        ctx.hook.rerender({controlled: ctx.controlled, loaded: true});
      },
      ctx => !ctx.loaded
    )
  },
  observe(ctx) {
    let s = current(ctx);
    return {
      controlled: ctx.controlled,
      loaded: ctx.loaded,
      input: s.inputValue,
      selected: s.selectedKey,
      open: s.isOpen,
      focused: s.isFocused,
      focusedKey: s.selectionManager.focusedKey,
      typingSafe: ctx.typingSafe,
      blurred: ctx.blurred,
      history: ctx.history
    };
  },
  invariants: {
    TypingNeverSelects: ctx => ctx.typingSafe,
    BlurMatchesSelection(ctx) {
      let s = current(ctx);
      return (
        !ctx.blurred ||
        s.inputValue ===
          (s.selectedKey == null ? '' : (s.collection.getItem(s.selectedKey)?.textValue ?? ''))
      );
    }
  }
});
