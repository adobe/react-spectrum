/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

jest.mock('react-aria/src/live-announcer/LiveAnnouncer');
import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import {Button} from '../src/Button';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Group} from '../src/Group';
import {I18nProvider} from 'react-aria/I18nProvider';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {NumberField, NumberFieldContext} from '../src/NumberField';
import React from 'react';
import {Text} from '../src/Text';
import userEvent from '@testing-library/user-event';

let TestNumberField = props => (
  <NumberField defaultValue={1024} minValue={0} data-foo="bar" {...props}>
    <Label>Width</Label>
    <Group {...props.groupProps}>
      <Button slot="decrement">-</Button>
      <Input />
      <Button slot="increment">+</Button>
    </Group>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
  </NumberField>
);

describe('NumberField', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('provides slots', () => {
    let {getByRole, getAllByRole} = render(<TestNumberField />);

    let group = getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('class', 'react-aria-Group');

    expect(group.closest('.react-aria-NumberField')).toHaveAttribute('data-foo', 'bar');

    let input = getByRole('textbox');
    expect(input).toHaveValue('1,024');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Width');

    expect(input).toHaveAttribute('aria-describedby');
    expect(
      input
        .getAttribute('aria-describedby')
        .split(' ')
        .map(id => document.getElementById(id).textContent)
        .join(' ')
    ).toBe('Description Error');

    let buttons = getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-label', 'Decrease');
    expect(buttons[1]).toHaveAttribute('aria-label', 'Increase');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <NumberFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestNumberField slot="test" />
      </NumberFieldContext.Provider>
    );

    let textbox = getByRole('textbox');
    expect(textbox.closest('.react-aria-NumberField')).toHaveAttribute('slot', 'test');
    expect(textbox).toHaveAttribute('aria-label', 'test');
  });

  it('should support custom render function', () => {
    let {getByRole} = render(
      <TestNumberField render={props => <div {...props} data-custom="true" />} />
    );
    let field = getByRole('textbox').closest('.react-aria-NumberField');
    expect(field).toHaveAttribute('data-custom', 'true');
  });

  it('should support hover state', async () => {
    let {getByRole} = render(
      <TestNumberField groupProps={{className: ({isHovered}) => (isHovered ? 'hover' : '')}} />
    );
    let group = getByRole('group');

    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');

    await user.hover(group);
    expect(group).toHaveAttribute('data-hovered', 'true');
    expect(group).toHaveClass('hover');

    await user.unhover(group);
    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');
  });

  it('should support focus visible state', async () => {
    let {getByRole} = render(
      <TestNumberField
        groupProps={{className: ({isFocusVisible}) => (isFocusVisible ? 'focus' : '')}}
      />
    );
    let group = getByRole('group');
    let input = getByRole('textbox');

    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(group).toHaveAttribute('data-focus-visible', 'true');
    expect(group).toHaveClass('focus');

    await user.tab();
    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');
  });

  it('should support read-only state', async () => {
    let {getByRole, rerender} = render(<TestNumberField />);

    let input = getByRole('textbox');

    expect(input.closest('.react-aria-NumberField')).not.toHaveAttribute('data-readonly');
    rerender(<TestNumberField isReadOnly />);
    expect(input.closest('.react-aria-NumberField')).toHaveAttribute('data-readonly');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <NumberField defaultValue={1024} minValue={300} maxValue={1400}>
        {({state}) => (
          <>
            <Label>
              Width (min: {state.minValue}, max: {state.maxValue})
            </Label>
            <Group>
              <Button slot="decrement">-</Button>
              <Input />
              <Button slot="increment">+</Button>
            </Group>
          </>
        )}
      </NumberField>
    );

    let input = getByRole('textbox');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveTextContent('Width (min: 300, max: 1400)');
  });

  it('should support form value', () => {
    let {rerender} = render(
      <TestNumberField
        name="test"
        form="test"
        value={25}
        formatOptions={{style: 'currency', currency: 'USD'}}
      />
    );
    let input = document.querySelector('input[name=test]');
    expect(input).toHaveValue('25');
    expect(input).toHaveAttribute('form', 'test');

    rerender(
      <TestNumberField
        name="test"
        form="test"
        value={null}
        formatOptions={{style: 'currency', currency: 'USD'}}
      />
    );
    expect(input).toHaveValue('');
  });

  it('should support disabled when having a form value', () => {
    render(
      <TestNumberField
        isDisabled
        name="test"
        form="test"
        value={25}
        formatOptions={{style: 'currency', currency: 'USD'}}
      />
    );
    let input = document.querySelector('input[name=test]');
    expect(input).toBeDisabled();
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(<TestNumberField data-testid="number-field" />);
    let outerEl = getAllByTestId('number-field');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-NumberField');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <NumberField isRequired>
          <Label>Width</Label>
          <Group>
            <Button slot="decrement">-</Button>
            <Input />
            <Button slot="increment">+</Button>
          </Group>
          <FieldError />
        </NumberField>
      </form>
    );

    let input = getByRole('textbox');
    let numberfield = input.closest('.react-aria-NumberField');
    expect(input).toHaveAttribute('required');
    expect(input).not.toHaveAttribute('aria-required');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);
    expect(numberfield).not.toHaveAttribute('data-invalid');

    act(() => {
      getByTestId('form').checkValidity();
    });

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'Constraints not satisfied'
    );
    expect(numberfield).toHaveAttribute('data-invalid');
    expect(document.activeElement).toBe(input);

    await user.keyboard('3');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(true);

    await user.tab();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(numberfield).not.toHaveAttribute('data-invalid');
  });

  it('supports pasting value in another numbering system', async () => {
    let {getByRole, rerender} = render(<TestNumberField />);
    let input = getByRole('textbox');
    await user.tab();
    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await user.paste('3.000.000,25');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('1,024');

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await user.paste('3 000 000,25');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('300,000,025');

    rerender(<TestNumberField formatOptions={{style: 'currency', currency: 'USD'}} />);

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await user.paste('3 000 000,256789');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('$3,000,000,256,789.00');

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await user.paste('1,000');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue(
      '$1,000.00',
      'Ambiguous value should be parsed using the current locale'
    );

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });

    await user.paste('1.000');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('$1.00', 'Ambiguous value should be parsed using the current locale');
  });

  it('should support arabic singular and dual counts', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <I18nProvider locale="ar-AE">
        <NumberField
          defaultValue={0}
          onChange={onChange}
          formatOptions={{style: 'unit', unit: 'day', unitDisplay: 'long'}}>
          <Label>Test</Label>
          <Group style={{display: 'flex'}}>
            <Button slot="decrement">-</Button>
            <Input />
            <Button slot="increment">+</Button>
          </Group>
          <FieldError />
        </NumberField>
      </I18nProvider>
    );
    let input = getByRole('textbox');
    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(input).toHaveValue('يوم');

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('يومان');
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('should not type the grouping characters when useGrouping is false', async () => {
    let {getByRole} = render(<TestNumberField formatOptions={{useGrouping: false}} />);
    let input = getByRole('textbox');

    await user.keyboard('102,4');
    expect(input).toHaveAttribute('value', '1024');

    await user.clear(input);
    expect(input).toHaveAttribute('value', '');

    await user.paste('102,4');
    await user.tab();
    expect(input).toHaveAttribute('value', '1024');

    await user.paste('1,024');
    await user.tab();
    expect(input).toHaveAttribute('value', '1024');
  });

  it('should not type the grouping characters when useGrouping is false and in German locale', async () => {
    let {getByRole} = render(
      <I18nProvider locale="de-DE">
        <TestNumberField formatOptions={{useGrouping: false}} />
      </I18nProvider>
    );
    let input = getByRole('textbox');

    await user.keyboard('102.4');
    expect(input).toHaveAttribute('value', '1024');

    await user.clear(input);
    expect(input).toHaveAttribute('value', '');

    await user.paste('102.4');
    await user.tab();
    expect(input).toHaveAttribute('value', '1024');

    await user.paste('1.024');
    await user.tab();
    expect(input).toHaveAttribute('value', '1024');
  });

  it('should trigger onChange via programmatic click() on stepper buttons', () => {
    const onChange = jest.fn();
    const {container} = render(<TestNumberField defaultValue={1024} onChange={onChange} />);
    act(() => {
      container.querySelector('[slot=increment]').click();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1025);
    act(() => {
      container.querySelector('[slot=decrement]').click();
    });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith(1024);
  });

  it('should allow you to delete the first digit in a number if it is followed by a group separator', async () => {
    let {getByRole} = render(
      <TestNumberField defaultValue={1024} formatOptions={{useGrouping: true}} />
    );
    let input = getByRole('textbox');
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue(',024');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('24');
  });

  it('supports onChange', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(<TestNumberField defaultValue={200} onChange={onChange} />);
    let input = getByRole('textbox');
    await user.tab();
    await user.clear(input);
    await user.keyboard('1024');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(1024);
  });

  it('should support pasting into a format', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <TestNumberField
        defaultValue={200}
        onChange={onChange}
        formatOptions={{style: 'currency', currency: 'USD'}}
      />
    );
    let input = getByRole('textbox');
    await user.tab();
    await user.clear(input);
    await user.paste('1,024');
    expect(input).toHaveValue('$1,024.00');
    expect(announce).toHaveBeenCalledTimes(2);
    expect(announce).toHaveBeenLastCalledWith('$1,024.00', 'assertive');
    expect(onChange).toHaveBeenCalledWith(1024);
  });

  it('should not change the input value if the new value is not accepted', async () => {
    let {getByRole} = render(<TestNumberField value={200} />);
    let input = getByRole('textbox');
    await user.tab();
    await user.clear(input);
    await user.paste('1024');
    expect(input).toHaveValue('200');
    expect(announce).toHaveBeenLastCalledWith('200', 'assertive');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('200');
  });

  it('should not reset validation errors on blur when value has not changed', async () => {
    let {getByRole} = render(
      <Form validationErrors={{testNumber: 'This field has an error.'}}>
        <NumberField name="testNumber" defaultValue={5}>
          <Label>Test Number</Label>
          <Group>
            <Button slot="decrement">-</Button>
            <Input />
            <Button slot="increment">+</Button>
          </Group>
          <FieldError />
        </NumberField>
      </Form>
    );

    let input = getByRole('textbox');
    let numberfield = input.closest('.react-aria-NumberField');

    // Validation error should be displayed
    expect(numberfield).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('aria-describedby');
    expect(
      document.getElementById(input.getAttribute('aria-describedby').split(' ')[0])
    ).toHaveTextContent('This field has an error.');

    // Focus the field without changing the value
    act(() => {
      input.focus();
    });
    expect(numberfield).toHaveAttribute('data-invalid');

    // Blur the field without changing the value
    act(() => {
      input.blur();
    });

    // Validation error should still be displayed because the value didn't change
    expect(numberfield).toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('aria-describedby');
    expect(
      document.getElementById(input.getAttribute('aria-describedby').split(' ')[0])
    ).toHaveTextContent('This field has an error.');
  });

  it('should not change the edited input value when value snapping is disabled', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <NumberField
          isRequired
          defaultValue={20}
          minValue={10}
          step={10}
          maxValue={50}
          commitBehavior="validate">
          <Label>Width</Label>
          <Group>
            <Button slot="decrement">-</Button>
            <Input />
            <Button slot="increment">+</Button>
          </Group>
          <FieldError />
        </NumberField>
      </form>
    );
    let input = getByRole('textbox');
    expect(input.validity.valid).toBe(true);

    // Over max
    await user.tab();
    await user.clear(input);
    await user.keyboard('1024');
    await user.tab();
    expect(input).toHaveValue('1,024');
    expect(announce).toHaveBeenLastCalledWith('1,024', 'assertive');
    expect(input.closest('.react-aria-NumberField')).toHaveAttribute('data-invalid', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.validity.valid).toBe(false);
    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent(
      'Constraints not satisfied'
    );

    act(() => {
      getByTestId('form').checkValidity();
    });
    expect(document.activeElement).toBe(input);

    // Valid
    await user.clear(input);
    await user.keyboard('30');
    await user.tab();
    expect(input).toHaveValue('30');
    expect(announce).toHaveBeenLastCalledWith('30', 'assertive');
    expect(input.validity.valid).toBe(true);
    expect(input).not.toHaveAttribute('aria-describedby');

    // Under min
    await user.clear(input);
    await user.keyboard('2');
    await user.tab();
    expect(input).toHaveValue('2');
    expect(announce).toHaveBeenLastCalledWith('2', 'assertive');
    expect(input.validity.valid).toBe(false);
    expect(input).toHaveAttribute('aria-describedby');

    act(() => {
      getByTestId('form').checkValidity();
    });
    expect(document.activeElement).toBe(input);

    // Not on step
    await user.clear(input);
    await user.keyboard('31');
    await user.tab();
    expect(input).toHaveValue('31');
    expect(announce).toHaveBeenLastCalledWith('31', 'assertive');
    expect(input.validity.valid).toBe(false);
    expect(input).toHaveAttribute('aria-describedby');

    act(() => {
      getByTestId('form').checkValidity();
    });
    expect(document.activeElement).toBe(input);

    // Required
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue('');
    expect(input.validity.valid).toBe(false);
    expect(input).toHaveAttribute('aria-describedby');

    // Valid
    await user.clear(input);
    await user.keyboard('30');
    await user.tab();
    expect(input).toHaveValue('30');
    expect(input.validity.valid).toBe(true);
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
