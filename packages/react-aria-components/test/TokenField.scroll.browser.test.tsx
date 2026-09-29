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

import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Token, TokenField, TokenInput} from '../src/TokenField';
import {TokenFieldSegment, TokenFieldValue} from 'react-stately/useTokenFieldState';
import {userEvent} from 'vitest/browser';

// The tag-field example converts a trailing delimiter into a token with no text after it.
class TagFieldValue extends TokenFieldValue {
  tokenize(text: string): TokenFieldSegment[] {
    let parts = text.split(/[, \n]/);
    let segments: TokenFieldSegment[] = parts.map((part, index) => {
      if (index === parts.length - 1 || part.length === 0) {
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
    return this.segments.map(segment => segment.text).join(', ');
  }
}

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

describeOrSkip('TokenField scrolling', () => {
  it.each(['ltr', 'rtl'] as const)(
    'keeps a visible tag field in place after Enter and Backspace (%s)',
    async dir => {
      let screen = await render(
        <div
          data-testid="scroller"
          dir={dir}
          style={{height: 180, overflow: 'auto', marginTop: 200}}>
          <div style={{height: 500}} />
          <TokenField aria-label="Tags" allowsNewlines defaultValue={new TagFieldValue([])}>
            <TokenInput style={{minHeight: 30}}>
              {segment => <Token>{segment.text}</Token>}
            </TokenInput>
          </TokenField>
          <div style={{height: 500}} />
        </div>
      );
      let scroller = screen.getByTestId('scroller').element();
      let input = screen.getByRole('textbox', {name: 'Tags'});
      scroller.scrollTop = 450;
      await userEvent.click(input);
      await userEvent.keyboard('Design');
      let scrollTop = scroller.scrollTop;
      expect(scrollTop).toBeGreaterThan(0);

      await userEvent.keyboard('{Enter}');
      await expect.element(input).toHaveTextContent('Design');
      expect(input.element().querySelector('[data-react-aria-token]')).not.toBeNull();
      expect(scroller.scrollTop).toBe(scrollTop);

      await userEvent.keyboard('x{Backspace}');
      await expect.element(input).toHaveTextContent('Design');
      expect(scroller.scrollTop).toBe(scrollTop);
      await expect.element(input).toHaveFocus();

      await userEvent.keyboard('{Backspace}{Backspace}');
      expect(input.element().querySelector('[data-react-aria-token]')).toBeNull();
      expect(scroller.scrollTop).toBe(scrollTop);
    }
  );

  it('scrolls newly created tokens into view when they wrap below the viewport', async () => {
    let screen = await render(
      <div
        data-testid="scroller"
        style={{height: 60, width: 100, overflow: 'auto', marginTop: 200}}>
        <TokenField aria-label="Tags" defaultValue={new TagFieldValue([])}>
          <TokenInput style={{minHeight: 20, lineHeight: '20px'}}>
            {segment => <Token style={{display: 'inline-block'}}>{segment.text}</Token>}
          </TokenInput>
        </TokenField>
      </div>
    );
    let scroller = screen.getByTestId('scroller').element();
    let input = screen.getByRole('textbox', {name: 'Tags'});
    await userEvent.click(input);
    await userEvent.keyboard('Design,Engineering,Accessibility,Testing,');

    let tokens = input.element().querySelectorAll('[data-react-aria-token]');
    expect(tokens).toHaveLength(4);
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(tokens[3].getBoundingClientRect().bottom).toBeLessThanOrEqual(
      scroller.getBoundingClientRect().bottom + 1
    );
  });
});
