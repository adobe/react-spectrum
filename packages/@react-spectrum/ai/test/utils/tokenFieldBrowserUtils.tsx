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

import {expect} from 'vitest';
import {
  getSelection,
  setSelection,
  Token,
  TokenField,
  type TokenFieldProps
} from '../../src/TokenField';
import {type Locator, userEvent} from 'vitest/browser';
import {Position, TokenFieldSegment, TokenSegmentList} from '../../src/TokenSegmentList';
import React, {useEffect, useState} from 'react';
import {render} from 'vitest-browser-react';

export function text(s: string): TokenFieldSegment {
  return {type: 'text', text: s};
}

export function token(s: string): TokenFieldSegment {
  return {type: 'token', text: s};
}

export function segments(...segs: TokenFieldSegment[]): TokenSegmentList {
  return new TokenSegmentList(segs);
}

/** Primary fixture: "ab" + token("TOK") + "cd" */
export const abTokCd = segments(text('ab'), token('TOK'), text('cd'));

/** Story sample for adjacent-token arrow navigation. */
export const adjacentTokensSample = new TokenSegmentList([
  {type: 'token', text: 'Hello'},
  {type: 'text', text: ' tokens testing '},
  {type: 'token', text: 'World'},
  {type: 'token', text: 'Testing'},
  {type: 'text', text: ' test'}
]);

export function expectFieldText(value: TokenSegmentList, str: string) {
  expect(value.toString()).toBe(str);
}

export function expectCaret(value: TokenSegmentList, pos: Position) {
  expect(value.caretPosition).toEqual(pos);
}

export function positionsEqual(a: Position, b: Position) {
  return a.index === b.index && a.offset === b.offset;
}

export function getFieldSelection(textboxEl: Element): [Position, Position] | null {
  return getSelection(textboxEl);
}

/** Tests run in the browser; matches TokenField isMac() platform detection. */
export function isMacPlatform(): boolean {
  return /^Mac/i.test(navigator.platform);
}

/** Returns Meta on Mac, Control elsewhere (matches TokenField undo/redo). */
export function modKey(): 'Meta' | 'Control' {
  return isMacPlatform() ? 'Meta' : 'Control';
}

/** Alt on Mac, Control elsewhere for word delete/navigation shortcuts in Chromium. */
export function wordDeleteModKey(): 'Alt' | 'Control' {
  return isMacPlatform() ? 'Alt' : 'Control';
}

/** Alias for wordDeleteModKey — Option/Ctrl + Arrow for word-wise caret movement. */
export function wordNavModKey(): 'Alt' | 'Control' {
  return wordDeleteModKey();
}

export async function waitForSelection(textbox: Locator, start: Position, end: Position = start) {
  let el = textbox.element();
  await expect.poll(() => getFieldSelection(el)).toEqual([start, end]);
}

export async function focusField(locator: Locator) {
  await userEvent.click(locator);
  await expect.element(locator).toHaveFocus();
}

export function setFieldSelection(textboxEl: Element, start: Position, end: Position): void {
  setSelection(textboxEl, start, end);
}

export async function navigateCaret(textbox: Locator, list: TokenSegmentList, target: Position) {
  await focusField(textbox);
  await userEvent.keyboard('{Home}');
  let el = textbox.element();
  for (let i = 0; i < 100; i++) {
    let sel = getFieldSelection(el);
    if (sel && positionsEqual(sel[0], target) && positionsEqual(sel[1], target)) {
      break;
    }
    await userEvent.keyboard(`{ArrowRight}`);
  }
}

/** Positions the caret by starting at the field end and stepping left. */
export async function navigateCaretFromEnd(
  textbox: Locator,
  _list: TokenSegmentList,
  target: Position
) {
  await focusField(textbox);
  let el = textbox.element();
  await userEvent.keyboard('{End}');
  for (let i = 0; i < 100; i++) {
    let sel = getFieldSelection(el);
    if (sel && positionsEqual(sel[0], target) && positionsEqual(sel[1], target)) {
      break;
    }
    await userEvent.keyboard('{ArrowLeft}');
  }
}

export async function selectRange(
  textbox: Locator,
  list: TokenSegmentList,
  start: Position,
  end: Position
) {
  let el = textbox.element();
  await focusField(textbox);
  await navigateCaret(textbox, list, start);
  for (let i = 0; i < 100; i++) {
    let sel = getFieldSelection(el);
    if (sel && positionsEqual(sel[1], end)) {
      break;
    }
    await userEvent.keyboard(`{Shift>}{ArrowRight}{/Shift}`);
  }
}

export interface ControlledTokenFieldResult {
  getValue: () => TokenSegmentList;
  textbox: Locator;
}

interface ControlledProps extends Omit<
  TokenFieldProps,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  initial: TokenSegmentList;
  valueRef: React.MutableRefObject<TokenSegmentList>;
}

function ControlledTokenField({
  initial,
  valueRef,
  'aria-label': ariaLabel = 'Message',
  ...props
}: ControlledProps) {
  let [value, setValue] = useState(initial);
  useEffect(() => {
    valueRef.current = value;
  }, [value, valueRef]);
  return (
    <TokenField value={value} onChange={setValue} aria-label={ariaLabel} {...props}>
      {segment => <Token>{segment.text}</Token>}
    </TokenField>
  );
}

let fieldInstance = 0;

export async function renderControlledTokenField(
  initial: TokenSegmentList,
  props?: Omit<TokenFieldProps, 'value' | 'defaultValue' | 'onChange' | 'children'>
): Promise<ControlledTokenFieldResult> {
  let label = `TokenField-${++fieldInstance}`;
  let valueRef = {current: initial};
  let screen = await render(
    <ControlledTokenField initial={initial} valueRef={valueRef} aria-label={label} {...props} />
  );
  let textbox = screen.getByRole('textbox', {name: label});
  return {
    getValue: () => valueRef.current,
    textbox
  };
}

export async function waitForFieldText(getValue: () => TokenSegmentList, str: string) {
  await expect.poll(() => getValue().toString()).toBe(str);
}

export async function waitForCaret(getValue: () => TokenSegmentList, pos: Position) {
  await expect.poll(() => getValue().caretPosition).toEqual(pos);
}
