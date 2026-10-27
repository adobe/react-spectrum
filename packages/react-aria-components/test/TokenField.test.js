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

import {Label} from '../src/Label';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {Text} from '../src/Text';
import {Token, TokenField, TokenInput} from '../src/TokenField';
import {TokenFieldValue} from 'react-stately/useTokenFieldState';

let TestTokenField = props => (
  <TokenField
    defaultValue={new TokenFieldValue([{type: 'text', text: 'hello'}])}
    data-foo="bar"
    {...props}>
    <Label>Test</Label>
    <TokenInput>{segment => <Token>{segment.text}</Token>}</TokenInput>
    <Text slot="description">Description</Text>
  </TokenField>
);

describe('TokenField', () => {
  describe('labeling', () => {
    it('should link the input to the label via aria-labelledby', () => {
      let {getByRole} = render(<TestTokenField />);

      let input = getByRole('textbox');
      expect(input.closest('.react-aria-TokenField')).toHaveAttribute('data-foo', 'bar');
      expect(input).toHaveClass('react-aria-TokenInput');

      expect(input).toHaveAttribute('aria-labelledby');
      let label = document.getElementById(input.getAttribute('aria-labelledby'));
      expect(label).toHaveAttribute('class', 'react-aria-Label');
      expect(label).toHaveTextContent('Test');
    });

    it('should link the input to the description via aria-describedby', () => {
      let {getByRole} = render(<TestTokenField />);

      let input = getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
      expect(
        input
          .getAttribute('aria-describedby')
          .split(' ')
          .map(id => document.getElementById(id).textContent)
          .join(' ')
      ).toBe('Description');
    });

    it('should support aria-label when no visible label is provided', () => {
      let {getByRole} = render(
        <TokenField
          aria-label="Message"
          defaultValue={new TokenFieldValue([{type: 'text', text: 'hello'}])}>
          <TokenInput>{segment => <Token>{segment.text}</Token>}</TokenInput>
        </TokenField>
      );

      let input = getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Message');
      expect(input).not.toHaveAttribute('aria-labelledby');
    });
  });
});
