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
import {ActionButton} from '@react-spectrum/button';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {Tooltip, TooltipTrigger} from '../';
import {TOOLTIP_COOLDOWN, TOOLTIP_DELAY} from '@react-stately/tooltip';

let CLOSE_TIME = 350;

describe('TooltipTrigger', function () {
  let onOpenChange = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // by firing an event at the beginning of each test, we can put ourselves into
    // keyboard modality for the test
    fireEvent.keyDown(document.body, {key: 'Tab'});
    fireEvent.keyUp(document.body, {key: 'Tab'});
  });

  afterEach(() => {
    onOpenChange.mockClear();
    // there's global state, so we need to make sure to run out the cooldown for every test
    act(() => {jest.runAllTimers();});
  });

  describe('immediate', () => {
    it('opens for focus',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      expect(() => {getByRole('tooltip');}).toThrow();

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
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
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

    it('can be keyboard force closed from anywhere',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
          <input type="text" />
        </Provider>
      );

      let button = getByLabelText('trigger');
      let input = getByRole('textbox');
      act(() => {
        input.focus();
      });
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
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
        input.blur();
      });
      fireEvent.mouseLeave(button);
      act(() => {
        jest.runAllTimers();
      });
      expect(() => getByRole('tooltip')).toThrow();
    });

    it('is closed if the trigger is clicked',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
            <ActionButton aria-label="trigger" />
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
      fireEvent.mouseDown(document.activeElement, {button: 0});
      fireEvent.mouseUp(document.activeElement, {button: 0});
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
    it('opens immediately for focus',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalled();
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
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
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
      fireEvent.mouseLeave(button);
      expect(onOpenChange).not.toHaveBeenCalled();
      act(() => {
        jest.runAllTimers();
      });
      expect(() => getByRole('tooltip')).toThrow();
    });

    it('opens for focus even if the delay was already in process',  () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      // halfway through, now add a focus
      // trigger modality to keyboard first
      fireEvent.keyDown(document.body, {key: 'Tab'});
      fireEvent.keyUp(document.body, {key: 'Tab'});
      act(() => {
        button.focus();
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      // finish the full amount of time started by hover
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
          <TooltipTrigger>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(() => getByRole('tooltip')).toThrow();
      // run half way through the timers and see if it's appeared
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      // finish the full amount of time, now it should be visible
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      let tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();
      fireEvent.mouseLeave(button);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();
      // it's been warmed up, so we can now instantly reopen for a short time
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      // close again
      fireEvent.mouseLeave(button);
      act(() => {
        jest.advanceTimersByTime(CLOSE_TIME);
      });
      expect(tooltip).not.toBeInTheDocument();

      // if we wait too long, we'll have to wait the full delay again
      act(() => {
        jest.advanceTimersByTime(TOOLTIP_COOLDOWN);
      });
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      expect(() => getByRole('tooltip')).toThrow();
      act(() => {jest.advanceTimersByTime(TOOLTIP_DELAY / 2);});
      tooltip = getByRole('tooltip');
      expect(tooltip).toBeVisible();

      // close again
      fireEvent.mouseLeave(button);
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
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="good-trigger" />
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="bad-trigger" />
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
      act(() => {
        badButton.blur();
      });
    });

    it('will not show a tooltip if the trigger is left during warmup, nor will warmup complete', () => {
      let helpfulText = 'Helpful information.';
      let unHelpfulText = 'Unhelpful information.';
      let {getByLabelText, getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger>
            <ActionButton aria-label="good-trigger" />
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <ActionButton aria-label="bad-trigger" />
            <Tooltip>{unHelpfulText}</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let goodButton = getByLabelText('good-trigger');
      let badButton = getByLabelText('bad-trigger');
      fireEvent.mouseEnter(goodButton);
      fireEvent.mouseMove(goodButton);
      act(() => {
        jest.advanceTimersByTime(TOOLTIP_DELAY / 2);
      });
      fireEvent.mouseLeave(goodButton);
      expect(() => getByText(helpfulText)).toThrow();
      expect(() => getByText(unHelpfulText)).toThrow();
      fireEvent.mouseEnter(badButton);
      fireEvent.mouseMove(badButton);
      act(() => {
        jest.advanceTimersByTime(TOOLTIP_DELAY / 2);
      });
      expect(() => getByText(helpfulText)).toThrow();
      expect(() => getByText(unHelpfulText)).toThrow();
      act(() => {
        jest.advanceTimersByTime(TOOLTIP_DELAY / 2);
      });
      let badTooltip = getByText(unHelpfulText);
      expect(badTooltip).toBeVisible();
      expect(() => getByText(helpfulText)).toThrow();
      fireEvent.mouseLeave(badButton);
    });
  });

  describe('overlay properties', () => {
    it('can be controlled open', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger isOpen delay={0} onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger isOpen={false} delay={0} onOpenChange={onOpenChange}>
            <ActionButton aria-label="trigger" />
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
          <TooltipTrigger defaultOpen delay={0}>
            <ActionButton aria-label="trigger" />
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

  describe('concurrently open tooltips', () => {
    it('does not allow more than one tooltip open at a time', () => {
      let helpfulText = 'Helpful information.';
      let unHelpfulText = 'Unhelpful information.';
      let {getByLabelText, getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="good-trigger" />
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="bad-trigger" />
            <Tooltip>{unHelpfulText}</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let goodButton = getByLabelText('good-trigger');
      let badButton = getByLabelText('bad-trigger');
      act(() => {
        goodButton.focus();
      });
      expect(getByText(helpfulText)).toBeVisible();

      // we've used focus to open one, now we can use hover to try and open a second one
      fireEvent.mouseEnter(badButton);
      fireEvent.mouseMove(badButton);

      expect(() => getByText(helpfulText)).toThrow();
      expect(getByText(unHelpfulText)).toBeVisible();
    });

    it('two can be open at once if in controlled open state', () => {
      let helpfulText = 'Helpful information.';
      let unHelpfulText = 'Unhelpful information.';
      let {getByLabelText, getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger isOpen delay={0}>
            <ActionButton aria-label="good-trigger" />
            <Tooltip>{helpfulText}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="bad-trigger" />
            <Tooltip>{unHelpfulText}</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let badButton = getByLabelText('bad-trigger');
      expect(getByText(helpfulText)).toBeVisible();

      // open a second one through interaction
      fireEvent.mouseEnter(badButton);
      fireEvent.mouseMove(badButton);

      expect(getByText(helpfulText)).toBeVisible();
      expect(getByText(unHelpfulText)).toBeVisible();
    });
  });
  describe('disabled', () => {
    it('can be disabled from the TooltipTrigger', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger isDisabled delay={0}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(() => getByRole('tooltip')).toThrow();
      fireEvent.mouseLeave(button);
    });

    // Given that a disabled button cannot be focused, i assume we want to stop this.
    // isDisabled on TooltipTrigger disables the tooltip, not the Button, this one makes some sense, though maybe a bad prop name?
    // isDisabled on the Button disables the Button, but not the tooltip, this one seems wrong
    //    should we disable mouse events on everything that is disabled?
    it('can be disabled from the trigger', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="trigger" isDisabled />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);

      expect(() => getByRole('tooltip')).toThrow();
      fireEvent.mouseLeave(button);
    });
  });

  describe('accessibility', () => {
    it('has a trigger described by the tooltip when open', () => {
      let {getByRole, getByLabelText} = render(
        <Provider theme={theme}>
          <TooltipTrigger delay={0}>
            <ActionButton aria-label="trigger" />
            <Tooltip>Helpful information.</Tooltip>
          </TooltipTrigger>
        </Provider>
      );
      let button = getByLabelText('trigger');
      fireEvent.mouseEnter(button);
      fireEvent.mouseMove(button);
      let tooltip = getByRole('tooltip');
      expect(button).toHaveAttribute('aria-describedBy', tooltip.id);
      fireEvent.mouseLeave(button);
    });
  });
});
