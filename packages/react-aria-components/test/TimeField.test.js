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

import {
  act,
  fireEvent,
  installPointerEvent,
  pointerMap,
  render,
  within
} from '@react-spectrum/test-utils-internal';
import {DateInput, DateSegment, TimeField, TimeFieldContext} from '../src/DateField';
import {FieldError} from '../src/FieldError';
import {I18nProvider} from 'react-aria/I18nProvider';
import {Label} from '../src/Label';
import React from 'react';
import {Text} from '../src/Text';
import {Time} from '@internationalized/date';
import userEvent from '@testing-library/user-event';

describe('TimeField', () => {
  installPointerEvent();

  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', () => {
    let {getByRole, getAllByRole} = render(
      <TimeField data-foo="bar">
        <Label>Birth date</Label>
        <DateInput data-bar="foo">
          {segment => <DateSegment segment={segment} data-test="test" />}
        </DateInput>
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
      </TimeField>
    );

    let input = getByRole('group');
    expect(input.textContent.replace(' ', ' ').replace(/[\u2066-\u2069]/g, '')).toBe('––:–– AM');
    expect(input).toHaveAttribute('class', 'react-aria-DateInput');
    expect(input).toHaveAttribute('data-bar', 'foo');

    expect(input.closest('.react-aria-TimeField')).toHaveAttribute('data-foo', 'bar');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Birth date');

    expect(input).toHaveAttribute('aria-describedby');
    expect(
      input
        .getAttribute('aria-describedby')
        .split(' ')
        .map(id => document.getElementById(id).textContent)
        .join(' ')
    ).toBe('Description Error');

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'react-aria-DateSegment');
      expect(segment).toHaveAttribute('data-placeholder', 'true');
      expect(segment).toHaveAttribute('data-type');
      expect(segment).toHaveAttribute('data-test', 'test');
    }
  });

  it('supports custom class names', () => {
    let {getByRole, getAllByRole} = render(
      <TimeField className="date-field">
        <Label>Birth date</Label>
        <DateInput className="date-input">
          {segment => (
            <DateSegment
              segment={segment}
              className={({isPlaceholder}) => `segment ${isPlaceholder ? 'placeholder' : ''}`}
            />
          )}
        </DateInput>
      </TimeField>
    );

    let input = getByRole('group');
    expect(input).toHaveAttribute('class', 'date-input');
    expect(input.closest('.date-field')).toBeInTheDocument();

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('class', 'segment placeholder');
    }
  });

  it('should support custom render function', () => {
    let {getByRole, getAllByRole} = render(
      <TimeField render={props => <div {...props} data-custom="true" />}>
        <Label render={props => <span {...props} data-custom="true" />}>Birth date</Label>
        <DateInput className="date-input" render={props => <div {...props} data-custom="true" />}>
          {segment => (
            <DateSegment
              segment={segment}
              render={props => <span {...props} data-custom="true" />}
            />
          )}
        </DateInput>
      </TimeField>
    );
    let input = getByRole('group');
    expect(input).toHaveAttribute('data-custom', 'true');
    expect(input.closest('.react-aria-TimeField')).toHaveAttribute('data-custom', 'true');
    expect(input.previousElementSibling).toHaveAttribute('data-custom', 'true');

    for (let segment of getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('data-custom', 'true');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <TimeFieldContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TimeField slot="test">
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </TimeFieldContext.Provider>
    );

    let group = getByRole('group');
    expect(group.closest('.react-aria-TimeField')).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support render props', () => {
    let {getByRole} = render(
      <TimeField
        minValue={new Time(6, 0, 0)}
        defaultValue={new Time(5, 0, 0)}
        validationBehavior="aria">
        {({isInvalid}) => (
          <>
            <Label>Birth date</Label>
            <DateInput data-validation-state={isInvalid ? 'invalid' : null}>
              {segment => <DateSegment segment={segment} />}
            </DateInput>
          </>
        )}
      </TimeField>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('data-validation-state', 'invalid');
  });

  it('should support disabled render prop', () => {
    let {getByRole} = render(
      <TimeField isDisabled>
        {({isDisabled}) => (
          <>
            <Label>Birth date</Label>
            <DateInput data-disabled-state={isDisabled ? 'disabled' : null}>
              {segment => <DateSegment segment={segment} />}
            </DateInput>
          </>
        )}
      </TimeField>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('data-disabled-state', 'disabled');
  });

  it('should support required render prop', () => {
    let {getByRole} = render(
      <TimeField isRequired>
        {({isRequired}) => (
          <>
            <Label>Time</Label>
            <DateInput data-required-state={isRequired ? 'required' : null}>
              {segment => <DateSegment segment={segment} />}
            </DateInput>
          </>
        )}
      </TimeField>
    );
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-required-state', 'required');
  });

  it('should support required state', () => {
    let {getByRole, rerender} = render(
      <TimeField>
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    );
    let group = getByRole('group');
    expect(group.closest('.react-aria-TimeField')).not.toHaveAttribute('data-required');
    rerender(
      <TimeField isRequired>
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    );
    expect(group.closest('.react-aria-TimeField')).toHaveAttribute('data-required');
  });

  it('should support form value', () => {
    render(
      <TimeField name="time" form="test" value={new Time(8, 30)}>
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    );
    let input = document.querySelector('input[name=time]');
    expect(input).toHaveValue('08:30:00');
    expect(input).toHaveAttribute('form', 'test');
  });

  it('supports validation errors', async () => {
    let {getByRole, getByTestId} = render(
      <form data-testid="form">
        <TimeField name="date" isRequired>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
          <FieldError />
        </TimeField>
      </form>
    );

    let group = getByRole('group');
    let input = document.querySelector('input[name=date]');
    expect(input).toHaveAttribute('required');
    expect(input.validity.valid).toBe(false);
    expect(group).not.toHaveAttribute('aria-describedby');

    act(() => {
      getByTestId('form').checkValidity();
    });

    expect(group).toHaveAttribute('aria-describedby');
    let getDescription = () =>
      group
        .getAttribute('aria-describedby')
        .split(' ')
        .map(d => document.getElementById(d).textContent)
        .join(' ');
    expect(getDescription()).toContain('Constraints not satisfied');
    expect(document.activeElement).toBe(within(group).getAllByRole('spinbutton')[0]);

    await user.keyboard('[ArrowUp][Tab][ArrowUp][Tab][ArrowUp]');

    expect(getDescription()).toContain('Constraints not satisfied');
    expect(input.validity.valid).toBe(true);

    await user.tab();

    expect(getDescription()).not.toContain('Constraints not satisfied');
  });

  it('selects AM or PM by typing the first letter', async () => {
    let {getAllByRole} = render(
      <TimeField defaultValue={new Time(0, 0)}>
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    );

    let dayPeriod = getAllByRole('spinbutton').find(
      segment => segment.getAttribute('data-type') === 'dayPeriod'
    );
    expect(dayPeriod).toHaveTextContent('AM');

    await user.click(dayPeriod);
    await user.keyboard('p');
    expect(dayPeriod).toHaveTextContent('PM');

    await user.click(dayPeriod);
    await user.keyboard('a');
    expect(dayPeriod).toHaveTextContent('AM');
  });

  // fr-CM resolves a 12-hour clock to a pattern with no dayPeriod part, including when hourCycle
  // forces 12-hour time. https://github.com/adobe/react-spectrum/issues/10833
  it('does not crash for locales whose 12-hour time has no day period', async () => {
    let {getByRole, getAllByRole, unmount} = render(
      <I18nProvider locale="fr-CM">
        <TimeField>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </I18nProvider>
    );

    expect(getByRole('group').textContent.replace(/[\u2066-\u2069]/g, '')).toBe('––:––');
    expect(getAllByRole('spinbutton').map(segment => segment.getAttribute('data-type'))).toEqual([
      'hour',
      'minute'
    ]);
    unmount();

    let twelveHour = render(
      <I18nProvider locale="fr-CM">
        <TimeField hourCycle={12} defaultValue={new Time(13, 45)}>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </I18nProvider>
    );
    let segments = twelveHour.getAllByRole('spinbutton');
    expect(segments.map(segment => segment.getAttribute('data-type'))).toEqual(['hour', 'minute']);
    expect(twelveHour.getByRole('group').textContent.replace(/[\u2066-\u2069]/g, '')).toBe('1:45');

    await user.click(segments[0]);
    await user.keyboard('a');
    expect(segments[0]).toHaveTextContent('1');
    twelveHour.unmount();

    let onChange = jest.fn();
    let typed = render(
      <I18nProvider locale="fr-CM">
        <TimeField onChange={onChange}>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </I18nProvider>
    );
    let typedSegments = typed.getAllByRole('spinbutton');
    await user.click(typedSegments[0]);
    await user.keyboard('1345');
    expect(onChange).toHaveBeenCalledWith(new Time(13, 45));
  });

  it.each([
    ['fr-FR', 'AM', 'p', 'PM', 'a', 'AM'],
    ['de-DE', 'AM', 'p', 'PM', 'a', 'AM'],
    ['ar-EG', 'ص', 'م', 'م', 'ص', 'ص'],
    ['zh-TW', '上午', '下', '下午', '上', '上午'],
    ['ja-JP', '午前', 'p', '午前', '午', '午前']
  ])('selects the day period in %s', async (locale, initial, toPm, pm, toAm, am) => {
    let {getAllByRole} = render(
      <I18nProvider locale={locale}>
        <TimeField hourCycle={12} defaultValue={new Time(0, 0)}>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </I18nProvider>
    );

    let dayPeriod = getAllByRole('spinbutton').find(
      segment => segment.getAttribute('data-type') === 'dayPeriod'
    );
    expect(dayPeriod).toHaveTextContent(initial);

    await user.click(dayPeriod);
    await user.keyboard(toPm);
    expect(dayPeriod).toHaveTextContent(pm);

    await user.click(dayPeriod);
    await user.keyboard(toAm);
    expect(dayPeriod).toHaveTextContent(am);
  });

  it('uses the runtime Korean day-period markers when typing', async () => {
    let formatter = new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    let getDayPeriod = hour => {
      let part = formatter
        .formatToParts(new Date(2000, 0, 1, hour))
        .find(part => part.type === 'dayPeriod');
      expect(part).toBeDefined();
      return part.value;
    };
    let am = getDayPeriod(0);
    let pm = getDayPeriod(12);

    let {getAllByRole} = render(
      <I18nProvider locale="ko-KR">
        <TimeField hourCycle={12} defaultValue={new Time(0, 0)}>
          <Label>Time</Label>
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
        </TimeField>
      </I18nProvider>
    );

    let dayPeriod = getAllByRole('spinbutton').find(
      segment => segment.getAttribute('data-type') === 'dayPeriod'
    );
    expect(dayPeriod).toHaveTextContent(am);

    await user.click(dayPeriod);
    await user.keyboard(pm[0]);
    // When both markers start with the same character, AM wins the first match.
    expect(dayPeriod).toHaveTextContent(am[0] === pm[0] ? am : pm);

    await user.click(dayPeriod);
    await user.keyboard(am[0]);
    expect(dayPeriod).toHaveTextContent(am);
  });

  it('ignores an empty composition when matching a day period', () => {
    let {getAllByRole} = render(
      <TimeField defaultValue={new Time(13, 0)}>
        <Label>Time</Label>
        <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    );

    let dayPeriod = getAllByRole('spinbutton').find(
      segment => segment.getAttribute('data-type') === 'dayPeriod'
    );
    expect(dayPeriod).toHaveTextContent('PM');

    let composition = data => {
      fireEvent(
        dayPeriod,
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: false,
          inputType: 'insertCompositionText',
          data
        })
      );
      fireEvent.input(dayPeriod, {inputType: 'insertCompositionText', data});
    };

    composition('');
    expect(dayPeriod).toHaveTextContent('PM');

    composition('a');
    expect(dayPeriod).toHaveTextContent('AM');
  });
});
