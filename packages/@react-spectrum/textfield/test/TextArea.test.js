/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {TextArea} from '../';
import V2TextArea from '@react/react-spectrum/Textarea';
import {testSlotsAPI} from '@react-spectrum/test-utils';

let testId = 'test-id';
let mockScrollHeight = 500;

function renderComponent(Component, props) {
  return render(<Component {...props} data-testid={testId} />);
}

describe('TextArea', () => {
  let onChange = jest.fn();
  let oldScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {configurable: true, value: mockScrollHeight});
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', oldScrollHeight);
  });

  afterEach(() => {
    onChange.mockClear();
    cleanup();
  });

  it('uses slots api', () => {
    testSlotsAPI(TextArea);
  });

  // The quiet variant of the textarea doesn't have a internal vertical scroller when the
  // user inputs more than two lines of text. To workaround this on user text input the height style of the textarea is set to
  // "auto" to get the scroller to appear, then the height is set equal to scrollHeight to remove the scroller
  // and properly adjust the height of the textarea to match the currently input text
  it.each`
    Name                | Component        | props
    ${'v3 TextArea'}    | ${TextArea}      | ${{isQuiet: true, onChange}}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${{quiet: true, onChange}}
  `('$Name quiet variant automatically adjusts its vertical height on change', ({Component, props}) => {
    let tree = renderComponent(Component, props);
    let input = tree.getByTestId(testId);

    expect(input.style.height).toBe('');
    fireEvent.change(input, {target: {value: '15', style: {}}});
    expect(input.style.height).toBe(`${mockScrollHeight}px`);
  });
});
