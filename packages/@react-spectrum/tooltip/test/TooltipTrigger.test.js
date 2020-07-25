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

import {act, fireEvent, render, waitFor} from '@testing-library/react';
import {ActionButton} from '@react-spectrum/button';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {TOOLTIP_COOLDOWN, TOOLTIP_DELAY} from '@react-stately/tooltip';
import {Tooltip, TooltipTrigger} from '../';

let CLOSE_TIME = 350;

describe('TooltipTrigger', function () {
  let onOpenChange = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    onOpenChange.mockClear();
  });

  describe('immediate', () => {
    it('opens for focus',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(tooltip).not.toBeInTheDocument();
    });

    it('opens for hover',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(tooltip).not.toBeInTheDocument();
    });

    it('if hovered and focused, will not hide if hover leaves',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      // add focus
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      // add hover
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      act(() => {
        jest.runAllTimers();
      });
      expect(tooltip).toBeVisible();

      // remove hover
      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      act(() => {
        jest.runAllTimers();
      });
      expect(tooltip).toBeVisible();

      // remove focus
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });

    it('if hovered and focused, will not hide if focus leaves',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      // add focus
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      // add hover
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      act(() => {
        jest.runAllTimers();
      });
      expect(tooltip).toBeVisible();

      // remove focus
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      act(() => {
        jest.runAllTimers();
      });
      expect(tooltip).toBeVisible();

      // remove hover
      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });

    it('can be keyboard force closed',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      fireEvent.keyDown(document.activeElement, {key: 'Escape'});
      fireEvent.keyUp(document.activeElement, {key: 'Escape'});
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
      act(() => {
        button.blur();
      });
      act(() => {
        jest.runAllTimers();
      });
      expect(() => getByRole('tooltip')).toThrow();
    });
  });

  describe('delay', () => {
    it('opens for focus',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      // finish the full amount of time, now it should be visible
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });

    it('opens for hover',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      // finish the full amount of time, now it should be visible
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      fireEvent.mouseLeave(button);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });

    it('never opens if blurred before it opens',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {
        button.blur();
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      act(() => {
        jest.runAllTimers();
      });
      expect(() => getByRole('tooltip')).toThrow();
    });

    it('opens for whichever occurs first',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      // halfway through, now add a hover
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      // finish the full amount of time started by focus, now it should be visible
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      // run out the time if it had started on hover
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      fireEvent.mouseLeave(button);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });

    it('once opened, it can be closed and opened instantly for a period of time',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      // finish the full amount of time, now it should be visible
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
      // it's been warmed up, so we can now instantly reopen for a short time
      act(() => {
        button.focus();
      });
      tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      // close again
      act(() => {
        button.blur();
      });
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();

      // if we wait too long, we'll have to wait the full delay again
      act(() => {
        jest.advanceTimersByTime(TOOLTIP_COOLDOWN);
      });
      act(() => {
        button.focus();
      });
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      // close again
      act(() => {
        button.blur();
      });
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });
  });
  describe('multiple tooltips', () => {
    it('can only show one tooltip at a time', () => {
      let helpfulText = 'Helpful information.';
      let unHelpfulText = 'Unhelpful information.';
      let {getByLabelText, getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger>
            <ActionButton aria-label="good-trigger"/>
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <ActionButton aria-label="bad-trigger"/>
            <Tooltip>{unHelpfulText}</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let goodButton = getByLabelText('good-trigger');
      let badButton = getByLabelText('bad-trigger');
      act(() => {
        goodButton.focus();
      });
      let goodTooltip = getByText(helpfulText);
      expect(goodTooltip).toBeVisible();
      expect(() => getByText(unHelpfulText)).toThrow();
      act(() => {
        goodButton.blur();
      });
      act(() => {
        badButton.focus();
      });
      let badTooltip = getByText(unHelpfulText);
      expect(badTooltip).toBeVisible();
      expect(() => getByText(helpfulText)).toThrow();
    });

    it('prevents a delayed tooltip from showing', () => {
      let helpfulText = 'Helpful information.';
      let unHelpfulText = 'Unhelpful information.';
      let {getByLabelText, getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger>
            <ActionButton aria-label="good-trigger"/>
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <ActionButton aria-label="bad-trigger"/>
            <Tooltip>{unHelpfulText}</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let goodButton = getByLabelText('good-trigger');
      let badButton = getByLabelText('bad-trigger');
      act(() => {
        goodButton.focus();
      });
      let goodTooltip = getByText(helpfulText);
      expect(goodTooltip).toBeVisible();
      expect(() => getByText(unHelpfulText)).toThrow();
      act(() => {
        goodButton.blur();
      });
      act(() => {
        badButton.focus();
      });
      let badTooltip = getByText(unHelpfulText);
      expect(badTooltip).toBeVisible();
      expect(() => getByText(helpfulText)).toThrow();
    });
  });

  describe('overlay properties', () => {
    it('can be controlled open', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger isOpen onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      expect(onOpenChange).not.toHaveBeenCalled();
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).toBeVisible();
    });

    it('can be controlled hidden', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger isOpen={false} onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(() => getByRole('tooltip')).toThrow();

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {
        button.blur();
      });
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(() => getByRole('tooltip')).toThrow();
    });

    it('can be uncontrolled open', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger defaultOpen>
            <ActionButton aria-label="trigger"/>
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(tooltip).toBeVisible();
      act(() => {
        button.blur();
      });
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
    });
  });
});
