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

import {HiddenDateInput} from '../';
import {useDateFieldState} from 'react-stately';
import {pointerMap} from '@react-spectrum/test-utils-internal';
import React, {useRef} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createCalendar} from '@internationalized/date';
import {useLocale} from 'react-aria';


const HiddenSelectDateFieldExample = (props) => {
  let {locale} = useLocale();
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  return (
    <HiddenDateInput
      autoComplete={props.autoComplete}
      name={props.name}
      isDisabled={props.isDisabled}
      state={state}
      {...props.hiddenProps} />
  );
};

describe('<HiddenDateInput />', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should trigger on onSelectionChange when select onchange is triggered (autofill)', async () => {
    const onSelectionChange = jest.fn();
    render(
      <HiddenSelectDateFieldExample
        onSelectionChange={onSelectionChange}
        items={makeItems(5)} />
    );

    const select = screen.getByLabelText('select');
    await user.selectOptions(select, '5');
    expect(onSelectionChange).toBeCalledWith('5');
  });

  it('should always add a data attribute data-a11y-ignore="aria-hidden-focus"', () => {
    render(
      <HiddenSelectDateFieldExample items={makeItems(5)} />
    );

    expect(screen.getByTestId('hidden-select-container')).toHaveAttribute('data-a11y-ignore', 'aria-hidden-focus');
  });

  it('should always add a data attribute data-react-aria-prevent-focus', () => {
    render(≠
      <HiddenSelectDateFieldExample items={makeItems(5)} />
    );

    expect(screen.getByTestId('hidden-select-container')).toHaveAttribute('data-react-aria-prevent-focus');
  });
});
