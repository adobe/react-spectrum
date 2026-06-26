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

/**
 * IME composition tests that emulate soft-keyboard (Android) text entry.
 *
 * Android's keyboard (Gboard/Samsung) routes nearly all editing — including plain
 * English typing, autocorrect, the suggestion bar, and backspace — through
 * non-cancelable composition events, and frequently recomposes the entire current
 * word rather than the single keystroke. We reproduce that here with real composition
 * events driven over CDP (Input.imeSetComposition / Input.insertText), which produce
 * trusted events AND real contentEditable DOM mutation, unlike synthetic dispatchEvent.
 *
 * CDP is Chromium-only, so these tests are gated to Chromium.
 */

import {
  abTokCd,
  focusField,
  isMacPlatform,
  modKey,
  navigateCaret,
  renderControlledTokenField,
  segments,
  setFieldSelection,
  text,
  token,
  waitForFieldText
} from './utils/tokenFieldBrowserUtils';
import {commands, userEvent} from 'vitest/browser';
import {describe, expect, it} from 'vitest';
import {isFirefox, isWebKit} from 'react-aria/private/utils/platform';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Token, TokenField} from '../src/TokenField';
import {TokenSegmentList} from '../src/TokenSegmentList';

declare module 'vitest/browser' {
  interface BrowserCommands {
    lockClipboard: () => Promise<void>;
    unlockClipboard: () => void;
    setComposition: (
      text: string,
      selectionStart: number,
      selectionEnd: number,
      replacementStart?: number,
      replacementEnd?: number
    ) => Promise<void>;
    commitComposition: (text: string) => Promise<void>;
  }
}

/**
 * Types a word the way a soft keyboard does: grows an active composition one grapheme
 * at a time (compositionstart + a series of compositionupdate), then commits it. If
 * `commit` differs from the typed string it emulates an autocorrect/replacement on commit.
 */
async function composeWord(word: string, commit = word) {
  for (let i = 1; i <= word.length; i++) {
    let sub = word.slice(0, i);
    await commands.setComposition(sub, sub.length, sub.length);
  }
  await commands.commitComposition(commit);
}

/** Visible text of the field (DOM), with the token zero-width-space markers removed. */
function domText(textbox: {element: () => Element}): string {
  return textbox.element().textContent?.replace(/​/g, '') ?? '';
}

/** Asserts the user-visible DOM text, which can diverge from the model after a composition. */
async function expectDOMText(textbox: {element: () => Element}, str: string) {
  await expect.poll(() => domText(textbox)).toBe(str);
}

// CDP composition is Chromium only.
const itAndroid = isFirefox() || isWebKit() ? it.skip : it;
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

describeOrSkip('TokenField IME composition (Android)', () => {
  itAndroid('types a word via composition into an empty field', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    await focusField(textbox);
    await composeWord('hello');
    await waitForFieldText(getValue, 'hello');
    await expectDOMText(textbox, 'hello');
  });

  itAndroid('types via composition after existing text', async () => {
    let list = segments(text('ab'));
    let {textbox, getValue} = await renderControlledTokenField(list);
    await navigateCaret(textbox, list, {index: 0, offset: 2});
    await composeWord('cd');
    await waitForFieldText(getValue, 'abcd');
    await expectDOMText(textbox, 'abcd');
  });

  itAndroid('commits an autocorrected word', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    await focusField(textbox);
    // User types "teh", keyboard autocorrects to "the" on commit.
    await composeWord('teh', 'the');
    await waitForFieldText(getValue, 'the');
    await expectDOMText(textbox, 'the');
  });

  itAndroid('types via composition after a token', async () => {
    let {textbox, getValue} = await renderControlledTokenField(abTokCd);
    // Caret just after the token (start of trailing "cd").
    await navigateCaret(textbox, abTokCd, {index: 2, offset: 0});
    await composeWord('x');
    await waitForFieldText(getValue, 'abTOKxcd');
    await expectDOMText(textbox, 'abTOKxcd');
  });

  itAndroid('backspaces within an active composition', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    await focusField(textbox);
    // Grow an active (uncommitted) composition, then shrink it, then commit.
    await commands.setComposition('h', 1, 1);
    await commands.setComposition('he', 2, 2);
    await commands.setComposition('hel', 3, 3);
    await commands.setComposition('hell', 4, 4);
    await commands.setComposition('hello', 5, 5);
    await commands.setComposition('hell', 4, 4);
    await commands.setComposition('hel', 3, 3);
    await commands.commitComposition('hel');
    await waitForFieldText(getValue, 'hel');
    await expectDOMText(textbox, 'hel');
  });

  // Android recomposes the whole current word (autocorrect, suggestion bar) by replacing
  // the existing characters. Driven via Input.imeSetComposition replacement offsets
  // (absolute, [start,end) into the text). Negative/caret-relative offsets crash the renderer.
  itAndroid('recomposes the whole current word', async () => {
    let list = segments(text('hello'));
    let {textbox, getValue} = await renderControlledTokenField(list);
    await navigateCaret(textbox, list, {index: 0, offset: 5});
    await commands.setComposition('HELLO', 5, 5, 0, 5);
    await commands.commitComposition('HELLO');
    await waitForFieldText(getValue, 'HELLO');
    await expectDOMText(textbox, 'HELLO');
  });

  itAndroid('composes a word immediately before a token', async () => {
    // Caret at the very start, before "ab" / token / "cd".
    let {textbox, getValue} = await renderControlledTokenField(abTokCd);
    await navigateCaret(textbox, abTokCd, {index: 0, offset: 0});
    await composeWord('x');
    await waitForFieldText(getValue, 'xabTOKcd');
    await expectDOMText(textbox, 'xabTOKcd');
  });

  itAndroid('composes between two adjacent tokens', async () => {
    let list = new TokenSegmentList([token('A'), token('B')]);
    let {textbox, getValue} = await renderControlledTokenField(list);
    // Caret between the two tokens.
    await navigateCaret(textbox, list, {index: 1, offset: 0});
    await composeWord('x');
    await waitForFieldText(getValue, 'AxB'); // text "x" inserted between tokens A and B
    await expectDOMText(textbox, 'AxB');
  });

  // Regression test for on-device duplication when typing immediately after a leading token.
  // The browser composes into a text node it places after the contentEditable=false token;
  // without the compositionend DOM-reconciliation the DOM would show 'TOKhellohello' even
  // though the model is the correct 'TOKhello'.
  itAndroid('composes immediately after a lone leading token without duplicating', async () => {
    let list = new TokenSegmentList([token('TOK')]);
    let {textbox, getValue} = await renderControlledTokenField(list);
    await focusField(textbox);
    await userEvent.keyboard('{End}');
    await composeWord('hello');
    await waitForFieldText(getValue, 'TOKhello'); // model is correct
    await expectDOMText(textbox, 'TOKhello'); // DOM must match the model, not 'TOKhellohello'
  });

  itAndroid('replaces a clicked (selected) token via composition', async () => {
    let {textbox, getValue} = await renderControlledTokenField(abTokCd);
    await focusField(textbox);
    // Clicking a token selects the whole element (userSelect: all).
    let tokenEl = textbox.element().querySelector('[contenteditable="false"]') as HTMLElement;
    await userEvent.click(tokenEl);
    await composeWord('x');
    await waitForFieldText(getValue, 'abxcd');
    await expectDOMText(textbox, 'abxcd');
  });

  itAndroid('replaces a selected token via composition (boundary range)', async () => {
    let {textbox, getValue} = await renderControlledTokenField(abTokCd);
    await focusField(textbox);
    // End of "ab" through start of "cd" — spans the token, the shape a click produces.
    setFieldSelection(textbox.element(), {index: 0, offset: 2}, {index: 2, offset: 0});
    await composeWord('x');
    await waitForFieldText(getValue, 'abxcd');
    await expectDOMText(textbox, 'abxcd');
  });

  // If the controlled parent re-renders the field while a composition is active,
  // React reconciliation can clobber the text node the IME is composing into,
  // corrupting or duplicating input. Here we force an external re-render.
  itAndroid('survives an external re-render mid-composition', async () => {
    let forceRender: () => void = () => {};
    function Harness() {
      let [value, setValue] = React.useState(() => segments(text('')));
      let [, setTick] = React.useState(0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      forceRender = () => setTick(t => t + 1);
      return (
        <TokenField value={value} onChange={setValue} aria-label="rerender-field">
          {segment => <Token>{segment.text}</Token>}
        </TokenField>
      );
    }
    let screen = await render(<Harness />);
    let textbox = screen.getByRole('textbox', {name: 'rerender-field'});
    await focusField(textbox);

    await commands.setComposition('h', 1, 1);
    await commands.setComposition('he', 2, 2);
    forceRender(); // parent re-renders while composition is active
    await commands.setComposition('hel', 3, 3);
    await commands.setComposition('hell', 4, 4);
    await commands.commitComposition('hello');

    await expectDOMText(textbox, 'hello');
  });

  // Android sometimes fires compositionstart and then a regular (non-composing) input event
  // without ever firing compositionend, leaving the field stuck in composing state (render
  // blocked, DOM diverged from the model). The beforeinput handler ends composition when a
  // non-composing event arrives mid-composition. We reproduce the exact sequence with CDP:
  // setComposition starts a composition, then a real keypress fires insertText (isComposing
  // false) with no compositionend in between.
  itAndroid('recovers when a non-composing input arrives before compositionend', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    await focusField(textbox);

    await commands.setComposition('h', 1, 1);
    await userEvent.keyboard('x');

    // The component is not stuck composing: the DOM re-rendered to match the model (a stuck
    // composition would leave the blocked DOM diverged from the model), with both characters
    // present and no duplication.
    await expect.poll(() => domText(textbox)).toBe(getValue().toString());
    expect(getValue().toString()).toHaveLength(2);
    expect([...getValue().toString()].sort().join('')).toBe('hx');

    // The field still accepts normal edits afterward (composition state was cleared).
    await userEvent.keyboard('z');
    await expect.poll(() => getValue().toString().length).toBe(3);
  });

  itAndroid('replaces a multi-character text selection via composition', async () => {
    let list = segments(text('hello'));
    let {textbox, getValue} = await renderControlledTokenField(list);
    await focusField(textbox);
    setFieldSelection(textbox.element(), {index: 0, offset: 0}, {index: 0, offset: 5});
    await composeWord('z');
    await waitForFieldText(getValue, 'z');
    await expectDOMText(textbox, 'z');
  });

  // Redo goes through the same compose-aware guard as undo: while composing it returns false
  // so the browser handles it, rather than running the component's model redo (which would
  // desync the model from the IME-controlled DOM).
  itAndroid('lets the browser handle redo during composition', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    let mod = modKey();
    await focusField(textbox);
    await composeWord('ab');
    await userEvent.keyboard(`{${mod}>}z{/${mod}}`); // undo (not composing) -> ''
    await commands.setComposition('q', 1, 1); // start a composition (model -> 'q')

    let redo = isMacPlatform() ? `{Shift>}{${mod}>}z{/${mod}}{/Shift}` : '{Control>}y{/Control}';
    await userEvent.keyboard(redo);

    // The component did not redo: the model stays at the composed 'q' and matches the DOM.
    await expect.poll(() => getValue().toString()).toBe('q');
    expect(domText(textbox)).toBe(getValue().toString());
  });

  // Triggering undo mid-composition must not run the component's model undo: that would
  // revert the model while the IME keeps mutating the DOM, leaving the two out of sync.
  // Instead the shortcut is ignored (returns false) so the browser handles undo natively.
  itAndroid('lets the browser handle undo during composition', async () => {
    let {textbox, getValue} = await renderControlledTokenField(segments(text('')));
    let mod = modKey();
    await focusField(textbox);
    await composeWord('hi'); // commit a word to build undo history
    await commands.setComposition('x', 1, 1); // start a new composition (model -> 'hix')

    await userEvent.keyboard(`{${mod}>}z{/${mod}}`);

    // The component did not undo: the model is unchanged and still matches the DOM.
    // (Without the fix, the model would revert to '' while the DOM still shows 'hix'.)
    let domText = () => textbox.element().textContent?.replace(/​/g, '') ?? '';
    await expect.poll(() => getValue().toString()).toBe('hix');
    expect(domText()).toBe(getValue().toString());
  });

  // onChange must fire for each composition update (before compositionend) so external UI
  // such as autocomplete can react to the in-progress text.
  itAndroid('emits onChange during composition', async () => {
    let changes: string[] = [];
    function Harness() {
      let [value, setValue] = React.useState(() => segments(text('')));
      return (
        <TokenField
          value={value}
          onChange={v => {
            changes.push(v.toString());
            setValue(v);
          }}
          aria-label="onchange-field">
          {segment => <Token>{segment.text}</Token>}
        </TokenField>
      );
    }
    let screen = await render(<Harness />);
    let textbox = screen.getByRole('textbox', {name: 'onchange-field'});
    await focusField(textbox);

    // Grow an active composition WITHOUT committing.
    await commands.setComposition('h', 1, 1);
    await commands.setComposition('he', 2, 2);
    await commands.setComposition('hel', 3, 3);

    // Updates were emitted mid-composition, before any compositionend.
    await expect.poll(() => changes.at(-1)).toBe('hel');
    expect(changes).toContain('h');

    await commands.commitComposition('hel');
    await expectDOMText(textbox, 'hel');
  });

  // While composing, onChange fires (so state updates) but React must not re-render the
  // editable subtree — re-rendering would reset the DOM nodes and break the IME. We assert
  // a token child is not re-invoked during composition, then is once composition ends.
  itAndroid('does not re-render the editable content until composition ends', async () => {
    let renderCount = 0;
    function CountingToken({children}: {children: string}) {
      renderCount++;
      return <Token>{children}</Token>;
    }
    function Harness() {
      // Leading token (rendered via the child fn) followed by editable text.
      let [value, setValue] = React.useState(() => new TokenSegmentList([token('A'), text('')]));
      return (
        <TokenField value={value} onChange={setValue} aria-label="norerender-field">
          {segment => <CountingToken>{segment.text}</CountingToken>}
        </TokenField>
      );
    }
    let screen = await render(<Harness />);
    let textbox = screen.getByRole('textbox', {name: 'norerender-field'});
    await focusField(textbox);
    // Caret after the token.
    await userEvent.keyboard('{End}');

    let countBefore = renderCount;
    await commands.setComposition('h', 1, 1);
    await commands.setComposition('he', 2, 2);
    await commands.setComposition('hel', 3, 3);

    // onChange has updated state, but the editable content was not re-rendered.
    expect(renderCount).toBe(countBefore);

    await commands.commitComposition('hel');
    // Composition ended -> the content re-renders to match the model.
    await expect.poll(() => renderCount).toBeGreaterThan(countBefore);
    await expectDOMText(textbox, 'Ahel');
  });

  // If a controlled update arrives mid-composition that doesn't match the composed value
  // (e.g. the user picks an autocomplete completion), composition ends early and the DOM
  // re-renders so it matches the controlled value rather than the in-progress composition.
  itAndroid('ends composition early when a controlled update inserts a completion', async () => {
    let valueRef = {current: segments(text(''))};
    let setValueExternal: (v: TokenSegmentList) => void = () => {};
    function Harness() {
      let [value, setValue] = React.useState(() => segments(text('')));
      valueRef.current = value;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setValueExternal = setValue;
      return (
        <TokenField value={value} onChange={setValue} aria-label="completion-field">
          {segment => <Token>{segment.text}</Token>}
        </TokenField>
      );
    }
    let screen = await render(<Harness />);
    let textbox = screen.getByRole('textbox', {name: 'completion-field'});
    await focusField(textbox);

    // User composes the start of a word.
    await commands.setComposition('c', 1, 1);
    await commands.setComposition('ca', 2, 2);
    await commands.setComposition('cal', 3, 3);
    await expect.poll(() => valueRef.current.toString()).toBe('cal');

    // The user selects a completion: the parent replaces the value with a token. This does
    // not match the in-progress composition, so composition ends early and the DOM updates.
    setValueExternal(new TokenSegmentList([token('Calendar')]));

    await expectDOMText(textbox, 'Calendar');
    expect(valueRef.current.toString()).toBe('Calendar');
  });
});
