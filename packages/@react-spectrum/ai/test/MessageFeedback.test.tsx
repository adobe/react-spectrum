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

import {MessageFeedback} from '@react-spectrum/ai';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

// Conditionally skip the suite
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('MessageFeedback', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders two toggle buttons with default labels', () => {
    let {getByRole} = render(<MessageFeedback aria-label="Rate this response" />);
    expect(getByRole('radio', {name: 'Good response'})).toBeInTheDocument();
    expect(getByRole('radio', {name: 'Bad response'})).toBeInTheDocument();
  });

  it('uses custom thumbUpLabel and thumbDownLabel', () => {
    let {getByRole} = render(
      <MessageFeedback
        aria-label="Rate this response"
        thumbUpLabel="Helpful"
        thumbDownLabel="Not helpful"
      />
    );
    expect(getByRole('radio', {name: 'Helpful'})).toBeInTheDocument();
    expect(getByRole('radio', {name: 'Not helpful'})).toBeInTheDocument();
  });

  it('forwards aria-label to the group', () => {
    let {getByRole} = render(<MessageFeedback aria-label="Rate this response" />);
    expect(getByRole('radiogroup')).toHaveAttribute('aria-label', 'Rate this response');
  });

  it('selects defaultValue when uncontrolled', () => {
    let {getByRole} = render(<MessageFeedback aria-label="Rate this response" defaultValue="up" />);
    expect(getByRole('radio', {name: 'Good response'})).toBeChecked();
    expect(getByRole('radio', {name: 'Bad response'})).not.toBeChecked();
  });

  it('fires onChange when an option is selected', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <MessageFeedback aria-label="Rate this response" onChange={onChange} />
    );

    await user.click(getByRole('radio', {name: 'Good response'}));
    expect(onChange).toHaveBeenLastCalledWith('up');

    await user.click(getByRole('radio', {name: 'Bad response'}));
    expect(onChange).toHaveBeenLastCalledWith('down');
  });

  it('fires onChange with null when toggled back off', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <MessageFeedback aria-label="Rate this response" defaultValue="up" onChange={onChange} />
    );

    await user.click(getByRole('radio', {name: 'Good response'}));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('respects the controlled value prop', () => {
    let {getByRole, rerender} = render(
      <MessageFeedback aria-label="Rate this response" value="up" onChange={() => {}} />
    );
    expect(getByRole('radio', {name: 'Good response'})).toBeChecked();

    rerender(<MessageFeedback aria-label="Rate this response" value="down" onChange={() => {}} />);
    expect(getByRole('radio', {name: 'Bad response'})).toBeChecked();
    expect(getByRole('radio', {name: 'Good response'})).not.toBeChecked();

    rerender(<MessageFeedback aria-label="Rate this response" value={null} onChange={() => {}} />);
    expect(getByRole('radio', {name: 'Good response'})).not.toBeChecked();
    expect(getByRole('radio', {name: 'Bad response'})).not.toBeChecked();
  });

  it('updates the selection on click when controlled via onChange', async () => {
    function Controlled() {
      let [value, setValue] = useState<'up' | 'down' | null>(null);
      return <MessageFeedback aria-label="Rate this response" value={value} onChange={setValue} />;
    }

    let {getByRole} = render(<Controlled />);
    await user.click(getByRole('radio', {name: 'Good response'}));
    expect(getByRole('radio', {name: 'Good response'})).toBeChecked();
  });

  it('disables both buttons when isDisabled is true', () => {
    let {getAllByRole} = render(<MessageFeedback aria-label="Rate this response" isDisabled />);
    let buttons = getAllByRole('radio');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });
});
