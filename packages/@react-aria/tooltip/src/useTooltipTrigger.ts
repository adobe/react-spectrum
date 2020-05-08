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

import {FocusEvents} from '@react-types/shared';
import {HoverProps, PressProps} from '@react-aria/interactions';
import {HTMLAttributes, RefObject} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {TooltipProps, TooltipTriggerAriaProps, TriggerProps} from '@react-types/tooltip';
import {TooltipTriggerState} from '@react-stately/tooltip';
import {useFocusable} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';

interface TooltipTriggerAria {
  triggerProps: HTMLAttributes<HTMLElement> & PressProps & HoverProps & FocusEvents,
  tooltipProps: HTMLAttributes<HTMLElement>
}

export function useTooltipTrigger(props: TooltipTriggerAriaProps, state: TooltipTriggerState, ref: RefObject<HTMLElement>) : TooltipTriggerAria {
  let {
    tooltipProps = {} as TooltipProps,
    triggerProps = {} as TriggerProps,
    isDisabled
  } = props;

  let tooltipId = useId(tooltipProps.id);
  let triggerId = useId(triggerProps.id);

  // abstract away knowledge of timing transitions from aria hook
  let tooltipManager = state.tooltipManager;

  let handleDelayedShow = () => {
    if (isDisabled) {
      return;
    }
    let triggerId = ref.current.id;
    tooltipManager.showTooltipDelayed(state, triggerId);
  };

  let handleDelayedHide = () => {
    tooltipManager.hideTooltipDelayed(state);
  };

  let onKeyDownTrigger = (e) => {
    if (ref && ref.current) {
      // dismiss tooltip on esc key press
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDelayedHide();
      }
    }
  };

  let {hoverProps} = useHover({
    isDisabled,
    onHover: handleDelayedShow,
    onHoverEnd: handleDelayedHide
  });

  let {focusableProps} = useFocusable({
    isDisabled,
    onFocus: handleDelayedShow,
    onBlur: handleDelayedHide,
    onKeyDown: onKeyDownTrigger
  }, ref);

  return {
    triggerProps: {
      id: triggerId,
      'aria-describedby': state.open ? tooltipId : undefined,
      ...mergeProps(focusableProps, hoverProps)
    },
    tooltipProps: {
      id: tooltipId
    }
  };
}
