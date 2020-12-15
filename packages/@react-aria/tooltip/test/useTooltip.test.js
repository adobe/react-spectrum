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

import {act, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useInteractionModality} from '@react-aria/interactions';
import {useTooltip, useTooltipTrigger} from '../';
import {useTooltipTriggerState} from '@react-stately/tooltip';

describe('useTooltip', function () {
  afterEach(() => {
    jest.useRealTimers();
  });
  it('opens tooltip on hover after delay', function () {
    jest.useFakeTimers('modern');

    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState();
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, queryByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);

    expect(queryByRole('tooltip')).toBeNull();
    act(jest.runAllTimers);
    expect(queryByRole('tooltip')).not.toBeNull();
  });
  it('opens tooltip immediately on hover with `delay: 0`', function () {
    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState({delay: 0});
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, queryByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);

    expect(queryByRole('tooltip')).not.toBeNull();
  });

  it('hides tooltip when hover leaves the trigger', function () {
    jest.useFakeTimers('modern');

    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState({delay: 0});
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, queryByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);
    expect(queryByRole('tooltip')).not.toBeNull();

    fireEvent.mouseLeave(triggerElement);
    act(jest.runAllTimers);
    expect(queryByRole('tooltip')).toBeNull();

  });

  it('keeps tooltip open when it gets hovered', function () {
    jest.useFakeTimers('modern');

    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState({delay: 0});
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps, state);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, getByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);

    const tooltipElement = getByRole('tooltip');
    fireEvent.mouseLeave(triggerElement);
    fireEvent.mouseEnter(tooltipElement);
    expect(getByRole('tooltip')).not.toBeNull();

    act(jest.runAllTimers);
    expect(getByRole('tooltip')).not.toBeNull();
  });

  it('hides tooltip when hover leaves', function () {
    jest.useFakeTimers('modern');

    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState({delay: 0});
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps, state);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, queryByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);

    const tooltipElement = queryByRole('tooltip');
    fireEvent.mouseLeave(triggerElement);
    fireEvent.mouseEnter(tooltipElement);
    expect(queryByRole('tooltip')).not.toBeNull();

    fireEvent.mouseLeave(tooltipElement);
    act(jest.runAllTimers);
    expect(queryByRole('tooltip')).toBeNull();
  });

  it('keeps tooltip open when hover returns to trigger from the tooltip', function () {
    jest.useFakeTimers('modern');

    function Test() {
      useInteractionModality();

      const state = useTooltipTriggerState({delay: 0});
      const {triggerProps, tooltipProps} = useTooltipTrigger({}, state);
      const {tooltipProps: finalTooltipProps} = useTooltip(tooltipProps, state);

      return (
        <div>
          <span {...triggerProps}>{'Trigger'}</span>
          {state.isOpen && <span {...finalTooltipProps}>{'Tooltip'}</span>}
        </div>
      );
    }

    const {container, getByRole} = render(<Test />);
    const triggerElement = container.firstChild.firstChild;

    // trigger pointer modality
    fireEvent.mouseMove(container);

    fireEvent.mouseEnter(triggerElement);

    const tooltipElement = getByRole('tooltip');
    fireEvent.mouseLeave(triggerElement);
    fireEvent.mouseEnter(tooltipElement);
    expect(getByRole('tooltip')).not.toBeNull();

    fireEvent.mouseLeave(tooltipElement);
    fireEvent.mouseEnter(triggerElement);
    act(jest.runAllTimers);
    expect(getByRole('tooltip')).not.toBeNull();
  });
});
