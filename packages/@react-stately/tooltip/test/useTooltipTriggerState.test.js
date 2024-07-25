/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render} from '@react-spectrum/test-utils-internal';
import {mergeProps, useTooltip, useTooltipTrigger} from 'react-aria';
import React from 'react';
import {useTooltipTriggerState} from '../src';

// Sync with TOOLTIP_COOLDOWN & TOOLTIP_DELAY in useTooltipTriggerState
const TOOLTIP_COOLDOWN = 500;
const TOOLTIP_DELAY = 1500;

function Tooltip({state, ...props}) {
  let {tooltipProps} = useTooltip(props, state);

  return (
    <span {...mergeProps(props, tooltipProps)}>
      {props.children}
    </span>
  );
}

function TooltipTrigger(props) {
  let state = useTooltipTriggerState(props);
  let ref = React.useRef();

  let {triggerProps, tooltipProps} = useTooltipTrigger(props, state, ref);

  return (
    <span>
      <button aria-label={props.label ?? 'trigger'} ref={ref} {...triggerProps}>
        {props.children}
      </button>
      {state.isOpen &&
        <Tooltip state={state} {...tooltipProps}>{props.tooltip}</Tooltip>}
    </span>
  );
}

function ManualTooltipTrigger(props) {
  let [isOpen, setOpen] = React.useState(false);

  const onOpenChange = (isOpen) => {
    props.onOpenChange(isOpen);
    setOpen(isOpen);
  };
  
  return (
    <TooltipTrigger
      label={props.label}
      onOpenChange={onOpenChange}
      isOpen={isOpen}
      tooltip={props.tooltip} />
  );
}

/**
 * Most of the tests for useTooltipTriggerState are in the React Spectrum package at
 * @react-spectrum/tooltip/test/TooltipTrigger.test.js. The React Spectrum tooltip
 * does not implement a custom close delay.
 */
describe('useTooltipTriggerState', function () {
  let onOpenChange = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    onOpenChange.mockClear();
    // there's global state, so we need to make sure to run out the cooldown for every test
    act(() => {jest.runAllTimers();});
  });

  describe('custom close delay', () => {
    it('closes with a custom close delay less than the default', () => {
      let closeDelay = 100;

      let {getByRole, queryByRole, getByLabelText} = render(
        <TooltipTrigger onOpenChange={onOpenChange} closeDelay={closeDelay} tooltip="Helpful information">
          Trigger
        </TooltipTrigger>
      );
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(queryByRole('tooltip')).toBeNull();

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(TOOLTIP_DELAY));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.mouseLeave(button);
      fireEvent.mouseMove(button);

      // run half of the way through the timer and confirm that it is still open
      act(() => jest.advanceTimersByTime(closeDelay / 2));
      expect(onOpenChange).toHaveBeenCalledWith(true);

      // run the rest of the way through the timer and confirm that it has closed
      // Note that closeDelay is less than the default close time of 500ms
      act(() => jest.advanceTimersByTime(closeDelay / 2));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes with a custom close delay more than the default', () => {
      let closeDelay = 650;
      let delay = 350;

      let {getByRole, queryByRole, getByLabelText} = render(
        <TooltipTrigger onOpenChange={onOpenChange} closeDelay={closeDelay} delay={delay} tooltip="Helpful information">
          Trigger
        </TooltipTrigger>
      );
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(queryByRole('tooltip')).toBeNull();

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(delay));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.mouseLeave(button);

      // run the timer to the default close time to make sure it hasn't closed
      act(() => jest.advanceTimersByTime(TOOLTIP_COOLDOWN));
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(tooltip).toBeVisible();

      // run the rest of the way through the timer and confirm that it has closed
      // Note that closeDelay is more than the default close time of 500ms
      act(() => jest.advanceTimersByTime(closeDelay - TOOLTIP_COOLDOWN));
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('closes immediately with a close delay less than zero', () => {
      let closeDelay = -50;

      let {getByRole, queryByRole, getByLabelText} = render(
        <TooltipTrigger onOpenChange={onOpenChange} closeDelay={closeDelay}  tooltip="Helpful information">
          Trigger
        </TooltipTrigger>
      );
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(queryByRole('tooltip')).toBeNull();

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(TOOLTIP_DELAY));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes immediately with a close delay of zero', () => {
      let closeDelay = 0;

      let {getByRole, queryByRole, getByLabelText} = render(
        <TooltipTrigger onOpenChange={onOpenChange} closeDelay={closeDelay}  tooltip="Helpful information">
          Trigger
        </TooltipTrigger>
      );
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(queryByRole('tooltip')).toBeNull();

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(TOOLTIP_DELAY));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('multiple controlled tooltips', () => {
    it('closes previus tooltip when opening a new one', () => {
      let secondOnOpenChange = jest.fn();

      let {queryByRole, getByLabelText} = render(
        <>
          <ManualTooltipTrigger onOpenChange={onOpenChange} tooltip="First tooltip" label="trigger1">
            Trigger 1
          </ManualTooltipTrigger>

          <ManualTooltipTrigger onOpenChange={secondOnOpenChange} tooltip="Second tooltip" label="trigger2">
            Trigger 2
          </ManualTooltipTrigger>
        </>
      );

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);

      let button1 = getByLabelText('trigger1');
      fireEvent.mouseEnter(button1);
      fireEvent.mouseMove(button1);

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(TOOLTIP_DELAY));

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(queryByRole('tooltip')).toBeVisible();

      let button2 = getByLabelText('trigger2');
      fireEvent.mouseEnter(button2);
      fireEvent.mouseMove(button2);

      // run through open timer and confirm that it has opened
      act(() => jest.advanceTimersByTime(TOOLTIP_DELAY));

      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
