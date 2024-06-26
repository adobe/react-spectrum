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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, FieldError, Group, Input, Label, NumberField, NumberFieldContext, Text} from '../';
import fc from 'fast-check';
import messages from '../intl/*.json';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {NumberParser} from '@internationalized/number';

let TestNumberField = (props) => (
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
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

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

  it('should support hover state', async () => {
    let {getByRole} = render(<TestNumberField groupProps={{className: ({isHovered}) => isHovered ? 'hover' : ''}} />);
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
    let {getByRole} = render(<TestNumberField groupProps={{className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''}} />);
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

  it('should support render props', () => {
    let {getByRole} = render(
      <NumberField defaultValue={1024} minValue={300} maxValue={1400}>
        {({state}) => (
          <>
            <Label>Width (min: {state.minValue}, max: {state.maxValue})</Label>
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
    let {rerender} = render(<TestNumberField name="test" value={25} formatOptions={{style: 'currency', currency: 'USD'}} />);
    let input = document.querySelector('input[name=test]');
    expect(input).toHaveValue('25');

    rerender(<TestNumberField name="test" value={null} formatOptions={{style: 'currency', currency: 'USD'}} />);
    expect(input).toHaveValue('');
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(
      <TestNumberField data-testid="number-field" />
    );
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

    act(() => {getByTestId('form').checkValidity();});

    expect(input).toHaveAttribute('aria-describedby');
    expect(document.getElementById(input.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
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
    act(() => {
      input.focus();
      input.setSelectionRange(0, input.value.length);
    });
    await userEvent.paste('3.000.000,25');
    expect(input).toHaveValue('3,000,000.25');

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await userEvent.paste('3 000 000,25');
    expect(input).toHaveValue('3,000,000.25');

    rerender(<TestNumberField formatOptions={{style: 'currency', currency: 'USD'}} />);
    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await userEvent.paste('3 000 000,256789');
    expect(input).toHaveValue('$3,000,000.26');

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });
    await userEvent.paste('1 000');
    expect(input).toHaveValue('$1,000.00');

    act(() => {
      input.setSelectionRange(0, input.value.length);
    });

    await userEvent.paste('1,000');
    expect(input).toHaveValue('$1,000.00', 'Ambiguous value should be parsed using the current locale');

    await userEvent.paste('1.000');
    expect(input).toHaveValue('$1.00', 'Ambiguous value should be parsed using the current locale');
  });

  // for some reason hu-HU isn't supported in jsdom/node
  let locales = Object.keys(messages).filter(locale => locale !== 'hu-HU');
  describe.only('round trips', function () {
    // Locales have to include: 'de-DE', 'ar-EG', 'fr-FR' and possibly others
    // But for the moment they are not properly supported
    const localesArb = fc.constantFrom(...locales);
    const styleOptsArb = fc.oneof(
      {withCrossShrink: true},
      fc.record({style: fc.constant('decimal')}),
      // 'percent' should be part of the possible options, but for the moment it fails for some tests
      fc.record({style: fc.constant('percent')}),
      fc.record(
        {
          style: fc.constant('currency'),
          currency: fc.constantFrom('USD', 'EUR', 'CNY', 'JPY'),
          currencyDisplay: fc.constantFrom('symbol', 'code', 'name')
        },
        {requiredKeys: ['style', 'currency']}
      ),
      fc.record(
        {style: fc.constant('unit'), unit: fc.constantFrom('inch', 'liter', 'kilometer-per-hour')},
        {requiredKeys: ['style', 'unit']}
      )
    );
    const genericOptsArb = fc.record({
      localeMatcher: fc.constantFrom('best fit', 'lookup'),
      unitDisplay: fc.constantFrom('narrow', 'short', 'long'),
      useGrouping: fc.boolean(),
      minimumIntegerDigits: fc.integer({min: 1, max: 21}),
      minimumFractionDigits: fc.integer({min: 0, max: 20}),
      maximumFractionDigits: fc.integer({min: 0, max: 20}),
      minimumSignificantDigits: fc.integer({min: 1, max: 21}),
      maximumSignificantDigits: fc.integer({min: 1, max: 21})
    }, {requiredKeys: []});

    // We restricted the set of possible values to avoid unwanted overflows to infinity and underflows to zero
    // and stay in the domain of legit values.
    const DOUBLE_MIN = Number.EPSILON;
    const valueArb = fc.tuple(
      fc.constantFrom(1, -1),
      fc.double({next: true, noNaN: true, min: DOUBLE_MIN, max: 1 / DOUBLE_MIN})
    ).map(([sign, value]) => sign * value);

    const inputsArb = fc.tuple(valueArb, localesArb, styleOptsArb, genericOptsArb)
      .map(([d, locale, styleOpts, genericOpts]) => ({d, opts: {...styleOpts, ...genericOpts}, locale}))
      .filter(({opts}) => opts.minimumFractionDigits === undefined || opts.maximumFractionDigits === undefined || opts.minimumFractionDigits <= opts.maximumFractionDigits)
      .filter(({opts}) => opts.minimumSignificantDigits === undefined || opts.maximumSignificantDigits === undefined || opts.minimumSignificantDigits <= opts.maximumSignificantDigits)
      .map(({d, opts, locale}) => {
        if (opts.style === 'percent') {
          opts.minimumFractionDigits = opts.minimumFractionDigits > 18 ? 18 : opts.minimumFractionDigits;
          opts.maximumFractionDigits = opts.maximumFractionDigits > 18 ? 18 : opts.maximumFractionDigits;
        }
        return {d, opts, locale};
      })
      .map(({d, opts, locale}) => {
        let adjustedNumberForFractions = d;
        if (Math.abs(d) < 1 && opts.minimumFractionDigits && opts.minimumFractionDigits > 1) {
          adjustedNumberForFractions = d * (10 ** (opts.minimumFractionDigits || 2));
        } else if (Math.abs(d) > 1 && opts.minimumFractionDigits && opts.minimumFractionDigits > 1) {
          adjustedNumberForFractions = d / (10 ** (opts.minimumFractionDigits || 2));
        }
        return {adjustedNumberForFractions, opts, locale};
      });

    it('should fully reverse NumberFormat', async function () {
      let onChange = jest.fn((val) => console.log(val));
      let {getByRole} = render(<TestNumberField onChange={onChange} />);
      await fc.assert(
        fc.asyncProperty(
          inputsArb,
          fc.scheduler({act}),
          async function ({adjustedNumberForFractions, locale, opts}, s) {
            s.scheduleSequence([{
              builder: async () => {
                const formatter = new Intl.NumberFormat(locale, opts);
                const parser = new NumberParser(locale, opts);

                const formattedOnce = formatter.format(adjustedNumberForFractions);
                let input = getByRole('textbox');
                console.log('input?', input.outerHTML)
                act(() => {
                  input.focus();
                  input.setSelectionRange(0, input.value.length);
                });
                console.log('gonna paste', formattedOnce)
                await userEvent.paste(formattedOnce);
                console.log('after paste')
              }, label: `entering ${adjustedNumberForFractions}`
            }]);
            // Assert
            while (s.count() !== 0) {
              await s.waitOne();
              console.log('mock call', onChange.mock.calls)
              expect(onChange).toHaveBeenLastCalledWith(adjustedNumberForFractions);
            }
          }
        ),
        {numRuns: 1000, timeout: 1000}
      );
    });
  });
});
