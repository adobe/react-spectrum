import {cleanup, fireEvent, render} from '@testing-library/react';
import {DatePicker, DateRangePicker} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('DatePickerBase', function () {
  afterEach(cleanup);

  describe('basics', function () {
    it.each`
      Name                   | Component            | numSegments
      ${'DatePicker'}        | ${DatePicker}        | ${3}
      ${'DateRangePicker'}   | ${DateRangePicker}   | ${6}
    `('$Name should render a default datepicker', ({Component, numSegments}) => {
      let {getByRole, getAllByRole} = render(<Component />);

      let combobox = getByRole('combobox');
      expect(combobox).toBeVisible();
      expect(combobox).not.toHaveAttribute('aria-disabled');
      expect(combobox).not.toHaveAttribute('aria-invalid');

      let segments = getAllByRole('spinbutton');
      expect(segments.length).toBe(numSegments);

      let button = getByRole('button');
      expect(button).toBeVisible();
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should set aria-disabled when isDisabled', ({Component}) => {
      let {getByRole, getAllByRole} = render(<Component isDisabled />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-disabled', 'true');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-disabled', 'true');
      }

      let button = getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should set aria-readonly when isReadOnly', ({Component}) => {
      let {getByRole, getAllByRole} = render(<Component isReadOnly />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-readonly', 'true');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-readonly', 'true');
      }

      let button = getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should set aria-required when isRequired', ({Component}) => {
      let {getByRole, getAllByRole} = render(<Component isRequired />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-required', 'true');

      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).toHaveAttribute('aria-required', 'true');
      }
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should set aria-invalid when validationState="invalid"', ({Component}) => {
      let {getByRole} = render(<Component validationState="invalid" />);

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('calendar popover', function () {
    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should open a calendar popover when clicking the button', ({Component}) => {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Component />
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
      expect(combobox).not.toHaveAttribute('aria-owns');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).not.toHaveAttribute('aria-controls');

      triggerPress(button);

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(dialog).toHaveAttribute('id');
      let dialogId = dialog.getAttribute('id');

      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(combobox).toHaveAttribute('aria-owns', dialogId);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', dialogId);

      // Focuses the calendar date
      expect(document.activeElement).toHaveAttribute('role', 'gridcell');
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should open a calendar popover pressing Alt + ArrowDown on the keyboard', ({Component}) => {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Component />
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
      expect(combobox).not.toHaveAttribute('aria-owns');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).not.toHaveAttribute('aria-controls');

      fireEvent.keyDown(combobox, {key: 'ArrowDown', altKey: true});

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(dialog).toHaveAttribute('id');
      let dialogId = dialog.getAttribute('id');

      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(combobox).toHaveAttribute('aria-owns', dialogId);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', dialogId);

      // Focuses the calendar date
      expect(document.activeElement).toHaveAttribute('role', 'gridcell');
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should open a calendar popover when tapping on the date field with a touch device', ({Component}) => {
      let {getByRole} = render(
        <Provider theme={theme}>
          <Component />
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
      expect(combobox).not.toHaveAttribute('aria-owns');

      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).not.toHaveAttribute('aria-controls');

      fireEvent.touchStart(combobox, {targetTouches: [{identifier: 1}]});
      fireEvent.touchEnd(combobox, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});

      let dialog = getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(dialog).toHaveAttribute('id');
      let dialogId = dialog.getAttribute('id');

      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(combobox).toHaveAttribute('aria-owns', dialogId);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', dialogId);

      // Focuses the calendar date
      expect(document.activeElement).toHaveAttribute('role', 'gridcell');
    });
  });

  describe('focus management', function () {
    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should support arrow keys to move between segments', ({Component}) => {
      let {getAllByRole} = render(<Component />);

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      for (let i = 0; i < segments.length; i++) {
        expect(segments[i]).toHaveFocus();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      }

      for (let i = segments.length - 1; i >= 0; i--) {
        expect(segments[i]).toHaveFocus();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
      }
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should support arrow keys to move between segments in an RTL locale', ({Component}) => {
      let {getAllByRole} = render(
        <Provider theme={theme} locale="ar-EG">
          <Component value={new Date(2019, 1, 3)} />
        </Provider>
      );

      let segments = getAllByRole('spinbutton');
      segments[0].focus();

      for (let i = 0; i < segments.length; i++) {
        expect(segments[i]).toHaveFocus();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
      }

      for (let i = segments.length - 1; i >= 0; i--) {
        expect(segments[i]).toHaveFocus();
        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      }
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should focus the next segment on mouse down on a literal segment', ({Component}) => {
      let {getAllByRole, getAllByText} = render(<Component />);
      let literals = getAllByText('/');
      let segments = getAllByRole('spinbutton');

      fireEvent.mouseDown(literals[0]);
      expect(segments[1]).toHaveFocus();
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should focus the next segment on mouse down on a non-editable segment', ({Component}) => {
      let format = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
        era: 'short'
      };

      let {getAllByTestId} = render(<Component formatOptions={format} />);

      fireEvent.mouseDown(getAllByTestId('weekday')[0]);
      expect(getAllByTestId('month')[0]).toHaveFocus();

      fireEvent.mouseDown(getAllByTestId('era')[0]);
      expect(getAllByTestId('hour')[0]).toHaveFocus();
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should not be focusable when isDisabled', ({Component}) => {
      let {getAllByRole} = render(<Component isDisabled />);
      let segments = getAllByRole('spinbutton');
      for (let segment of segments) {
        expect(segment).not.toHaveAttribute('tabIndex');
      }
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should focus the first segment by default if autoFocus is set', ({Component}) => {
      let {getAllByRole} = render(<Component autoFocus />);

      let segments = getAllByRole('spinbutton');
      expect(segments[0]).toHaveFocus();
    });
  });

  describe('validation', function () {
    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should display an error icon when validationState="invalid"', ({Component}) => {
      let {getByTestId} = render(<Component validationState="invalid" />);
      expect(getByTestId('invalid-icon')).toBeVisible();
    });

    it.each`
      Name                   | Component
      ${'DatePicker'}        | ${DatePicker}
      ${'DateRangePicker'}   | ${DateRangePicker}
    `('$Name should display an checkmark icon when validationState="valid"', ({Component}) => {
      let {getByTestId} = render(<Component validationState="valid" />);
      expect(getByTestId('valid-icon')).toBeVisible();
    });
  });
});
