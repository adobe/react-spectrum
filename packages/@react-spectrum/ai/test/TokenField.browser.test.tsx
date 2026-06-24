/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Browser integration tests for TokenField editing behavior.
 * IME/composition, and tokenRegex are out of scope.
 */

import {
  abTokCd,
  adjacentTokensSample,
  dblClickAt,
  expectCaret,
  focusField,
  getFieldSelection,
  modKey,
  navigateCaret,
  navigateCaretFromEnd,
  renderControlledTokenField,
  segments,
  selectRange,
  setFieldSelection,
  text,
  token,
  waitForCaret,
  waitForFieldText,
  waitForSelection,
  wordDeleteModKey,
  wordNavModKey
} from './utils/tokenFieldBrowserUtils';
import {commands, userEvent} from 'vitest/browser';
import {describe, expect, it} from 'vitest';
import {isFirefox, isWebKit} from 'react-aria/private/utils/platform';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Token, TokenField} from '../src/TokenField';

declare module 'vitest/browser' {
  interface BrowserCommands {
    lockClipboard: () => Promise<void>;
    unlockClipboard: () => void;
  }
}

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('TokenField browser interactions', () => {
  describe('rendering', () => {
    it('should render textbox and tokens', async () => {
      let screen = await render(
        <TokenField defaultValue={abTokCd} aria-label="Message">
          {segment => <Token>{segment.text}</Token>}
        </TokenField>
      );
      await expect.element(screen.getByRole('textbox', {name: 'Message'})).toBeInTheDocument();
      await expect.element(screen.getByText('TOK')).toBeInTheDocument();
    });
  });

  describe('caret movement', () => {
    it('skips over token with ArrowRight from end of preceding text', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await navigateCaret(textbox, abTokCd, {index: 0, offset: 2});
      await userEvent.keyboard('{ArrowRight}');
      let el = textbox.element();
      await expect
        .poll(() => {
          let sel = getFieldSelection(el);
          return sel && sel[0].index === 2 && sel[0].offset === 0;
        })
        .toBe(true);
    });

    it('navigates between adjacent tokens with ArrowRight', async () => {
      let {textbox} = await renderControlledTokenField(adjacentTokensSample);
      // Place caret at end of text before "World" (segment index 1, offset 18)
      await focusField(textbox);
      await userEvent.keyboard('{Home}');
      // Navigate to end of " tokens testing " via many arrow rights
      await userEvent.keyboard('{ArrowRight>18}');
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 4, offset: 0});
    });

    it('navigates between adjacent tokens with ArrowLeft', async () => {
      let {textbox} = await renderControlledTokenField(adjacentTokensSample);
      await navigateCaretFromEnd(textbox, adjacentTokensSample, {index: 4, offset: 0});
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
      await waitForSelection(textbox, {index: 1, offset: 15});
    });

    it('skips over token with ArrowLeft from start of following text', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await navigateCaretFromEnd(textbox, abTokCd, {index: 2, offset: 0});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 0, offset: 2});
    });

    it('skips over token with ArrowRight from end of preceding text', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await navigateCaretFromEnd(textbox, abTokCd, {index: 0, offset: 2});
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 2, offset: 0});
    });

    it('skips over adjacent token with ArrowRight from start of first token', async () => {
      let twoTokens = segments(token('A'), token('B'));
      let {textbox} = await renderControlledTokenField(twoTokens);
      await navigateCaret(textbox, twoTokens, {index: 0, offset: 0});
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 1, offset: 0});
    });

    it('skips over adjacent token with ArrowLeft from start of second token', async () => {
      let twoTokens = segments(token('A'), token('B'));
      let {textbox} = await renderControlledTokenField(twoTokens);
      await navigateCaretFromEnd(textbox, twoTokens, {index: 1, offset: 0});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 0, offset: 0});
    });

    it('moves over an emoji as a single grapheme', async () => {
      let list = segments(text('a😀b'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 1});
      // ArrowRight steps over the whole emoji (2 code units), not into the middle of it.
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 0, offset: 3});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 0, offset: 1});
    });

    it('moves to field start with Home on single line', async () => {
      let list = segments(text('hello'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 5});
      await userEvent.keyboard('{Home}');
      await waitForSelection(textbox, {index: 0, offset: 0});
    });

    it('moves to field end with End on single line', async () => {
      let list = segments(text('hello'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 0});
      await userEvent.keyboard('{End}');
      await waitForSelection(textbox, {index: 0, offset: 5});
    });

    it('moves to previous line boundary with Home in multiline field', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 11});
      await userEvent.keyboard('{Home}');
      await waitForSelection(textbox, {index: 0, offset: 5});
    });

    it('moves to end of line with End in multiline field', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 6});
      await userEvent.keyboard('{End}');
      await waitForSelection(textbox, {index: 0, offset: 11});
    });

    it('moves caret backward by word with word navigation shortcut', async () => {
      let list = segments(text('hello world'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 11});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{${mod}>}{ArrowLeft}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 6});
    });

    it('moves caret forward by word with word navigation shortcut', async () => {
      let list = segments(text('hello world'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 0});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{${mod}>}{ArrowRight}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 5});
    });

    it('word navigation skips over token backward as atomic unit', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await navigateCaretFromEnd(textbox, abTokCd, {index: 2, offset: 0});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{${mod}>}{ArrowLeft}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 2});
    });

    it('word navigation skips over token forward as atomic unit', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await navigateCaretFromEnd(textbox, abTokCd, {index: 0, offset: 2});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{${mod}>}{ArrowRight}{/${mod}}`);
      await waitForSelection(textbox, {index: 2, offset: 0});
    });

    it('moves to line start with line navigation shortcut in multiline field', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 11});
      let mod = modKey();
      await userEvent.keyboard(`{${mod}>}{ArrowLeft}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 6});
    });

    it('moves to line end with line navigation shortcut in multiline field', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 6});
      let mod = modKey();
      await userEvent.keyboard(`{${mod}>}{ArrowRight}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 11});
    });
  });

  describe('rtl caret movement', () => {
    // In RTL text the visual arrow keys map to the opposite logical direction: ArrowLeft moves
    // the caret forward through the text and ArrowRight moves it backward.
    it('moves the caret in the visual direction in RTL text', async () => {
      let list = segments(text('אבגד'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      setFieldSelection(el, {index: 0, offset: 2}, {index: 0, offset: 2});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 0, offset: 3});
      setFieldSelection(el, {index: 0, offset: 2}, {index: 0, offset: 2});
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 0, offset: 1});
    });

    it('skips over a token in the visual direction in RTL text', async () => {
      let list = segments(text('אב'), token('ך'), text('גד'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      // ArrowLeft (visual left = logical forward) crosses the token to the following text.
      setFieldSelection(el, {index: 0, offset: 2}, {index: 0, offset: 2});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 2, offset: 0});
      // ArrowRight (visual right = logical backward) crosses back over the token.
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 0, offset: 2});
    });

    it('extends the selection in the visual direction in RTL text', async () => {
      let list = segments(text('אבגד'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      setFieldSelection(el, {index: 0, offset: 2}, {index: 0, offset: 2});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 0, offset: 4});
    });

    it('extends the selection across a token in RTL text', async () => {
      let list = segments(text('אב'), token('ך'), text('גד'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      setFieldSelection(el, {index: 0, offset: 2}, {index: 0, offset: 2});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 2, offset: 0});
    });

    it('moves the caret by word in the visual direction in RTL text', async () => {
      // "שלום עולם" = two words separated by a space (offsets 0-4 and 5-9).
      let list = segments(text('שלום עולם'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      let mod = wordNavModKey();
      // Word + ArrowLeft (visual left = logical forward) moves to the end of the first word.
      setFieldSelection(el, {index: 0, offset: 0}, {index: 0, offset: 0});
      await userEvent.keyboard(`{${mod}>}{ArrowLeft}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 4});
      // Word + ArrowRight (visual right = logical backward) moves to the start of the last word.
      setFieldSelection(el, {index: 0, offset: 9}, {index: 0, offset: 9});
      await userEvent.keyboard(`{${mod}>}{ArrowRight}{/${mod}}`);
      await waitForSelection(textbox, {index: 0, offset: 5});
    });

    it('moves to the line boundaries with Home and End in RTL text', async () => {
      let list = segments(text('שלום עולם'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      setFieldSelection(el, {index: 0, offset: 4}, {index: 0, offset: 4});
      await userEvent.keyboard('{Home}');
      await waitForSelection(textbox, {index: 0, offset: 0});
      await userEvent.keyboard('{End}');
      await waitForSelection(textbox, {index: 0, offset: 9});
    });
  });

  describe('bidirectional text', () => {
    it('deletes the previous character with Backspace in RTL text', async () => {
      let list = segments(text('שלום'));
      let {textbox, getValue} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      setFieldSelection(el, {index: 0, offset: 4}, {index: 0, offset: 4});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'שלו');
    });

    it('crosses a token atomically in mixed RTL and LTR text', async () => {
      // RTL text, an LTR token, then RTL text.
      let list = segments(text('שלום'), token('ABC'), text('עולם'));
      let {textbox} = await renderControlledTokenField(list, {dir: 'rtl'} as any);
      let el = textbox.element();
      await focusField(textbox);
      // From the boundary before the token, ArrowLeft (logical forward) jumps the whole token.
      setFieldSelection(el, {index: 0, offset: 4}, {index: 0, offset: 4});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 2, offset: 0});
      // ArrowRight (logical backward) crosses back over the token.
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 0, offset: 4});
    });

    it('moves through and back across mixed bidirectional text', async () => {
      // "ab" (LTR) + "גד" (RTL) + "ef" (LTR). The visual path differs across browsers, but the
      // caret must traverse the whole field and a round trip must return to the start.
      let list = segments(text('abגדef'));
      let {textbox} = await renderControlledTokenField(list);
      await focusField(textbox);
      await userEvent.keyboard('{Home}');
      await waitForSelection(textbox, {index: 0, offset: 0});
      await userEvent.keyboard('{ArrowRight>6}');
      await waitForSelection(textbox, {index: 0, offset: 6});
      await userEvent.keyboard('{ArrowLeft>6}');
      await waitForSelection(textbox, {index: 0, offset: 0});
    });
  });

  describe('selection', () => {
    it('selects token atomically when extending selection across it', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      let el = textbox.element();
      await navigateCaret(textbox, abTokCd, {index: 0, offset: 2});
      let rect = el.getBoundingClientRect();
      await userEvent.click(textbox, {
        modifiers: ['Shift'],
        position: {x: rect.width - 8, y: rect.height / 2}
      });
      await expect
        .poll(() => {
          let sel = getFieldSelection(el);
          if (!sel) {
            return false;
          }
          let [start, end] = sel;
          return abTokCd.slice(start, end).toString().includes('TOK');
        })
        .toBe(true);
    });

    it('marks token as selected on double-click', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await userEvent.dblClick(textbox.getByText('TOK'));
      let tokenEl = textbox.getByText('TOK').element();
      await expect.poll(() => tokenEl.getAttribute('data-selected')).toBe('true');
    });

    it('selects entire line including tokens on triple-click', async () => {
      let lineWithToken = segments(text('hello '), token('TOK'), text(' world\nsecond'));
      let {textbox} = await renderControlledTokenField(lineWithToken);
      let tokenEl = textbox.getByText('TOK').element();
      await userEvent.tripleClick(textbox.getByText('TOK'));
      await waitForSelection(textbox, {index: 0, offset: 0}, {index: 2, offset: 6});
      await expect(tokenEl.getAttribute('data-selected')).toBe('true');
    });

    it('select-all then typing replaces entire field', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      let mod = modKey();
      await focusField(textbox);
      await userEvent.keyboard(`{${mod}>}a{/${mod}}`);
      let tokenEl = textbox.getByText('TOK').element();
      await expect.poll(() => tokenEl.getAttribute('data-selected')).toBe('true');
      await userEvent.keyboard('z');
      await waitForFieldText(getValue, 'z');
    });

    it('deletes selection spanning token and text', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 1}, {index: 2, offset: 1});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'ad');
    });

    it('extends selection across token with Shift+ArrowRight', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      let tokenEl = textbox.getByText('TOK').element();
      await navigateCaret(textbox, abTokCd, {index: 0, offset: 1});
      await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 2, offset: 1});
      await expect(tokenEl.getAttribute('data-selected')).toBe('true');
    });

    it('extends selection across token with Shift+ArrowLeft', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      let tokenEl = textbox.getByText('TOK').element();
      await navigateCaret(textbox, abTokCd, {index: 2, offset: 1});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 2, offset: 1});
      await expect(tokenEl.getAttribute('data-selected')).toBe('true');
    });

    it('extends selection to the left with Shift+ArrowLeft', async () => {
      let list = segments(text('abcde'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 3});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 0, offset: 3});
    });

    it('moves selection back to the right with Shift+ArrowRight without extending past the anchor', async () => {
      let list = segments(text('abcde'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 3});
      // Extend left to select "bc".
      await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 0, offset: 3});
      // Shift+ArrowRight shrinks the selection from the left rather than extending it to the right.
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 0, offset: 3});
    });

    it('extends back to the left after moving right with Shift+ArrowLeft', async () => {
      let list = segments(text('abcde'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 3});
      // Extend left, move back right, then extend left again. The anchor stays fixed at offset 3.
      await userEvent.keyboard('{Shift>}{ArrowLeft}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 0, offset: 3});
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 0, offset: 3});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 1}, {index: 0, offset: 3});
    });

    it('keeps direction when shrinking a selection across a token', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      let tokenEl = textbox.getByText('TOK').element();
      // Caret after the token (start of "cd"). Extend left across the token to select it.
      await navigateCaretFromEnd(textbox, abTokCd, {index: 2, offset: 0});
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 2, offset: 0});
      await expect.poll(() => tokenEl.getAttribute('data-selected')).toBe('true');
      // Shift+ArrowRight shrinks back across the token rather than extending to the right.
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await waitForSelection(textbox, {index: 2, offset: 0}, {index: 2, offset: 0});
      await expect.poll(() => tokenEl.getAttribute('data-selected')).toBe(null);
    });

    it('collapses the selection to the right edge with ArrowRight', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 1}, {index: 2, offset: 1});
      // A plain arrow collapses to the edge without moving the caret past it.
      await userEvent.keyboard('{ArrowRight}');
      await waitForSelection(textbox, {index: 2, offset: 1});
    });

    it('collapses the selection to the left edge with ArrowLeft', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 1}, {index: 2, offset: 1});
      await userEvent.keyboard('{ArrowLeft}');
      await waitForSelection(textbox, {index: 0, offset: 1});
    });

    it('extends a double-clicked word to the left with Shift+ArrowLeft', async () => {
      if (isFirefox()) {
        // Firefox does not treat double clicks as directionless.
        return;
      }

      // Double clicking a word creates a directionless selection. Shift+ArrowLeft should
      // extend it to the left rather than shrinking it from the right.
      let list = segments(text('aaaa bbbb cccc'));
      let {textbox} = await renderControlledTokenField(list);
      let el = textbox.element();
      await focusField(textbox);
      await dblClickAt(textbox, el.childNodes[0], 6); // inside "bbbb"
      let sel = getFieldSelection(el)!;
      let [start, end] = sel;
      // The double click should have selected a whole word away from the field boundaries.
      expect(start.offset).toBeGreaterThan(0);
      expect(end.offset).toBeGreaterThan(start.offset);
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await waitForSelection(textbox, {index: start.index, offset: start.offset - 1}, end);
    });

    it('extends a double-clicked word to the right with Shift+ArrowRight', async () => {
      let list = segments(text('aaaa bbbb cccc'));
      let {textbox} = await renderControlledTokenField(list);
      let el = textbox.element();
      await focusField(textbox);
      await dblClickAt(textbox, el.childNodes[0], 6); // inside "bbbb"
      let sel = getFieldSelection(el)!;
      let [start, end] = sel;
      expect(end.offset).toBeGreaterThan(start.offset);
      expect(end.offset).toBeLessThan(14);
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await waitForSelection(textbox, start, {index: end.index, offset: end.offset + 1});
    });

    it('extends selection backward by word with word selection shortcut', async () => {
      let list = segments(text('hello world'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 11});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{Shift>}{${mod}>}{ArrowLeft}{/${mod}}{/Shift}`);
      await waitForSelection(textbox, {index: 0, offset: 6}, {index: 0, offset: 11});
    });

    it('extends selection forward by word with word selection shortcut', async () => {
      let list = segments(text('hello world'));
      let {textbox} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 0});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{Shift>}{${mod}>}{ArrowRight}{/${mod}}{/Shift}`);
      await waitForSelection(textbox, {index: 0, offset: 0}, {index: 0, offset: 5});
    });

    it('extends selection backward by word across token', async () => {
      let {textbox} = await renderControlledTokenField(abTokCd);
      let tokenEl = textbox.getByText('TOK').element();
      await navigateCaretFromEnd(textbox, abTokCd, {index: 2, offset: 0});
      let mod = wordNavModKey();
      await userEvent.keyboard(`{Shift>}{${mod}>}{ArrowLeft}{/${mod}}{/Shift}`);
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 2, offset: 0});
      await expect(tokenEl.getAttribute('data-selected')).toBe('true');
    });

    it('extends selection to line start with line selection shortcut', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 11});
      let mod = modKey();
      await userEvent.keyboard(`{Shift>}{${mod}>}{ArrowLeft}{/${mod}}{/Shift}`);
      await waitForSelection(textbox, {index: 0, offset: 6}, {index: 0, offset: 11});
    });

    it('extends selection to line end with line selection shortcut', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 6});
      let mod = modKey();
      await userEvent.keyboard(`{Shift>}{${mod}>}{ArrowRight}{/${mod}}{/Shift}`);
      await waitForSelection(textbox, {index: 0, offset: 6}, {index: 0, offset: 11});
    });
  });

  describe('insert and delete', () => {
    it('types at end of empty text field', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
      await focusField(textbox);
      await userEvent.type(textbox, 'hello');
      await waitForFieldText(getValue, 'hello');
      expectCaret(getValue(), {index: 0, offset: 5});
    });

    it('types in the middle of text', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await navigateCaret(textbox, abTokCd, {index: 0, offset: 1});
      await userEvent.keyboard('x');
      await waitForFieldText(getValue, 'axbTOKcd');
      await waitForCaret(getValue, {index: 0, offset: 2});
    });

    it('inserts at clicked position in text', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('hello')));
      let el = textbox.element();
      let textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE) as Text;
      let range = document.createRange();
      range.setStart(textNode, 2);
      range.collapse(true);
      let selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      await userEvent.keyboard('X');
      await waitForFieldText(getValue, 'heXllo');
    });

    it('replaces token when typing after clicking token', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await userEvent.click(textbox.getByText('TOK'));
      await waitForSelection(textbox, {index: 0, offset: 2}, {index: 2, offset: 0});
      await userEvent.keyboard('NEW');
      await waitForFieldText(getValue, 'abNEWcd');
    });

    it('deletes one character with Backspace', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('abc')));
      await navigateCaret(textbox, segments(text('abc')), {index: 0, offset: 3});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'ab');
      await waitForCaret(getValue, {index: 0, offset: 2});
    });

    it('deletes one character with Delete', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('abc')));
      await navigateCaret(textbox, segments(text('abc')), {index: 0, offset: 1});
      await userEvent.keyboard('{Delete}');
      await waitForFieldText(getValue, 'ac');
    });

    it('deletes full emoji as one grapheme with Backspace', async () => {
      let emojiText = `a${'😀'}b`;
      let list = segments(text(emojiText));
      let {textbox, getValue} = await renderControlledTokenField(list);
      // Caret after the emoji, before "b".
      await navigateCaret(textbox, list, {index: 0, offset: 3});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'ab');
    });

    it('deletes full emoji as one grapheme with Delete', async () => {
      let emojiText = `a${'😀'}b`;
      let list = segments(text(emojiText));
      let {textbox, getValue} = await renderControlledTokenField(list);
      await navigateCaret(textbox, list, {index: 0, offset: 1});
      await userEvent.keyboard('{Delete}');
      await waitForFieldText(getValue, 'ab');
    });

    it('deletes token with Backspace at boundary after token', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await navigateCaret(textbox, abTokCd, {index: 2, offset: 0});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'abcd');
    });

    it('deletes token with Delete at boundary before token', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await navigateCaret(textbox, abTokCd, {index: 0, offset: 2});
      await userEvent.keyboard('{Delete}');
      await waitForFieldText(getValue, 'abcd');
    });

    it('deletes selection with Delete key', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 1}, {index: 2, offset: 1});
      await userEvent.keyboard('{Delete}');
      await waitForFieldText(getValue, 'ad');
    });

    it('deletes selection with Backspace key', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 1}, {index: 2, offset: 1});
      await userEvent.keyboard('{Backspace}');
      await waitForFieldText(getValue, 'ad');
    });

    it('deletes previous word with word-delete shortcut', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('hello world')));
      await navigateCaret(textbox, segments(text('hello world')), {index: 0, offset: 11});
      let mod = wordDeleteModKey();
      await userEvent.keyboard(`{${mod}>}{Backspace}{/${mod}}`);
      await waitForFieldText(getValue, 'hello ');
    });

    it('deletes next word with word-delete shortcut', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('hello world')));
      await navigateCaret(textbox, segments(text('hello world')), {index: 0, offset: 5});
      let mod = wordDeleteModKey();
      await userEvent.keyboard(`{${mod}>}{Delete}{/${mod}}`);
      await waitForFieldText(getValue, 'hello');
    });

    it('deletes to start of line with line-delete shortcut', async () => {
      let multiline = segments(text('hello\nworld'));
      let {textbox, getValue} = await renderControlledTokenField(multiline);
      // End of second line — Home/ArrowDown/End varies across browsers in contenteditable.
      await navigateCaret(textbox, multiline, {index: 0, offset: 11});
      let mod = modKey();
      await userEvent.keyboard(`{${mod}>}{Backspace}{/${mod}}`);
      await waitForFieldText(getValue, 'hello');
    });

    it('deletes forward to end of line with line-delete forward shortcut', async () => {
      if (isWebKit() || isFirefox()) {
        // webkit doesn't support Control + K shortcut (it deletes one character instead).
        // Firefox supports it but doesn't seem to work in playwright.
        return;
      }
      let multiline = segments(text('hello\nworld'));
      let {textbox, getValue} = await renderControlledTokenField(multiline);
      await navigateCaret(textbox, multiline, {index: 0, offset: 7});
      // Mac: Ctrl+K; Windows/Linux: Ctrl+Delete.
      let mac = modKey() === 'Meta';
      if (mac) {
        await userEvent.keyboard('{Control>}k{/Control}');
      } else {
        await userEvent.keyboard('{Control>}Delete{/Control}');
      }
      await waitForFieldText(getValue, 'hello\nw');
    });
  });

  describe('clipboard', () => {
    it('pastes plain text at caret', async () => {
      let list = segments(text('ab'));
      let {textbox, getValue} = await renderControlledTokenField(list);
      await selectRange(textbox, list, {index: 0, offset: 0}, {index: 0, offset: 2});
      await commands.lockClipboard();
      try {
        await userEvent.copy();
        await navigateCaret(textbox, list, {index: 0, offset: 2});
        await userEvent.paste();
        await waitForFieldText(getValue, 'abab');
      } finally {
        await commands.unlockClipboard();
      }
    });

    it('copy and paste preserves token segments within field', async () => {
      let {textbox, getValue} = await renderControlledTokenField(abTokCd);
      await selectRange(textbox, abTokCd, {index: 0, offset: 0}, {index: 2, offset: 2});
      await commands.lockClipboard();
      try {
        await userEvent.copy();
        await navigateCaret(textbox, abTokCd, {index: 2, offset: 2});
        await userEvent.paste();
        await expect
          .poll(() => getValue().segments)
          .toEqual([text('ab'), token('TOK'), text('cdab'), token('TOK'), text('cd')]);
      } finally {
        await commands.unlockClipboard();
      }
    });

    it('cuts selected text', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('hello')));
      await selectRange(
        textbox,
        segments(text('hello')),
        {index: 0, offset: 1},
        {index: 0, offset: 4}
      );
      await commands.lockClipboard();
      try {
        await userEvent.cut();
        await waitForFieldText(getValue, 'ho');
      } finally {
        await commands.unlockClipboard();
      }
    });

    it('cut removes selection and paste restores elsewhere', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('hello')));
      await selectRange(
        textbox,
        segments(text('hello')),
        {index: 0, offset: 0},
        {index: 0, offset: 2}
      );
      await commands.lockClipboard();
      try {
        await userEvent.cut();
        await waitForFieldText(getValue, 'llo');
        await navigateCaret(textbox, segments(text('llo')), {index: 0, offset: 3});
        await userEvent.paste();
        await waitForFieldText(getValue, 'llohe');
      } finally {
        await commands.unlockClipboard();
      }
    });
  });

  describe('undo and redo', () => {
    it('undoes typing', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
      await focusField(textbox);
      await userEvent.type(textbox, 'abc');
      await waitForFieldText(getValue, 'abc');
      let mod = modKey();
      await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
      await waitForFieldText(getValue, '');
    });

    it('coalesces consecutive typing into one undo step', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
      await focusField(textbox);
      await userEvent.type(textbox, 'xyz');
      await waitForFieldText(getValue, 'xyz');
      let mod = modKey();
      await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
      await waitForFieldText(getValue, '');
    });

    it('redoes after undo', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
      await focusField(textbox);
      await userEvent.type(textbox, 'hi');
      await waitForFieldText(getValue, 'hi');
      let mod = modKey();
      let mac = mod === 'Meta';
      await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
      await waitForFieldText(getValue, '');
      if (mac) {
        await userEvent.keyboard(`{${mod}>}{Shift>}z{/Shift}{/${mod}}`);
      } else {
        await userEvent.keyboard('{Control>}y{/Control}');
      }
      await waitForFieldText(getValue, 'hi');
    });

    it('new edit after undo replaces redo branch', async () => {
      let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
      await focusField(textbox);
      await userEvent.type(textbox, 'a');
      await waitForFieldText(getValue, 'a');
      let mod = modKey();
      let mac = mod === 'Meta';
      await userEvent.keyboard(`{${mod}>}z{/${mod}}`);
      await waitForFieldText(getValue, '');
      await userEvent.type(textbox, 'b');
      await waitForFieldText(getValue, 'b');
      if (mac) {
        await userEvent.keyboard(`{${mod}>}{Shift>}z{/Shift}{/${mod}}`);
      } else {
        await userEvent.keyboard('{Control>}y{/Control}');
      }
      await waitForFieldText(getValue, 'b');
    });
  });
});
