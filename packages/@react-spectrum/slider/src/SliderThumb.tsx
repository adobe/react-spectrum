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

import {AriaSliderThumbProps} from '@react-types/slider';
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import {SliderState} from '@react-stately/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useSliderThumb} from '@react-aria/slider';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface SliderThumbProps extends AriaSliderThumbProps {
  trackRef: RefObject<HTMLElement>,
  inputRef?: RefObject<HTMLInputElement>,
  state: SliderState
}

export function SliderThumb(props: SliderThumbProps) {
  let {
    index,
    inputRef,
    state
  } = props;
  let backupRef = useRef<HTMLInputElement>();
  inputRef = inputRef || backupRef;

  let {thumbProps, inputProps} = useSliderThumb({
    ...props,
    inputRef
  }, state);

  let {hoverProps, isHovered} = useHover({});
  let {direction} = useLocale();
  let cssDirection = direction === 'rtl' ? 'right' : 'left';

  return (
    <FocusRing within focusRingClass={classNames(styles, 'is-focused')}>
      <div
        className={
          classNames(
            styles,
            'spectrum-Slider-handle',
            {
              'is-hovered': isHovered,
              'is-dragged': state.isThumbDragging(index),
              'is-tophandle': state.focusedThumb === index
            }
          )
        }
        style={{[cssDirection]: `${state.getThumbPercent(index) * 100}%`}}
        {...mergeProps(thumbProps, hoverProps)}
        role="presentation">
        <VisuallyHidden>
          <input className={classNames(styles, 'spectrum-Slider-input')} ref={inputRef} {...inputProps} />
        </VisuallyHidden>
      </div>
    </FocusRing>
  );
}
