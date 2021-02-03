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

import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {ColorThumb} from './ColorThumb';
import {Flex} from '@react-spectrum/layout';
import {FocusableRef} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import React, {useRef, useState} from 'react';
import {SpectrumColorSliderProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorslider/vars.css';
import {useColorSlider} from '@react-aria/color';
import {useColorSliderState} from '@react-stately/color';
import {useFocus, useFocusVisible} from '@react-aria/interactions';
import {useLocale, useNumberFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function ColorSlider(props: SpectrumColorSliderProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {isDisabled, channel, orientation, showValueLabel = true} = props;
  let vertical = orientation === 'vertical';

  let {styleProps} = useStyleProps(props);
  let {direction} = useLocale();

  let inputRef = useRef();
  let trackRef = useRef();
  let domRef = useFocusableRef(ref, inputRef);

  let labelText = props.label;

  let numberFormatter = useNumberFormatter();
  let state = useColorSliderState({...props, numberFormatter});
  let {inputProps, thumbProps, groupProps, trackProps, labelProps, gradientProps} = useColorSlider({
    ...props,
    'aria-label': channel,
    trackRef,
    inputRef
  }, state);

  if (props.label === undefined && !vertical) {
    labelText = inputProps['aria-label'];
  }

  let {isFocusVisible} = useFocusVisible();
  let [isFocused, setIsFocused] = useState(false);
  let {focusProps} = useFocus({
    isDisabled,
    onFocusChange: setIsFocused
  });

  let thumbPosition = state.getThumbPercent(0);
  if (vertical || direction === 'rtl') {
    thumbPosition = 1 - thumbPosition;
  }

  let alignLabel;
  if (vertical) {
    alignLabel = 'center';
  } else if (labelText != null && showValueLabel) {
    alignLabel = 'space-between';
  } else if (labelText != null) {
    alignLabel = 'flex-start';
  } else if (showValueLabel) {
    alignLabel = 'flex-end';
  }

  return (
    <div
      ref={domRef}
      {...styleProps}
      className={classNames(
        styles,
        {
          'spectrum-ColorSlider-container--horizontal': !vertical,
          'spectrum-ColorSlider-container--vertical': vertical
        }
      )}>
      {!vertical &&
        <Flex direction="row" justifyContent={alignLabel}>
          {labelText && <Label {...labelProps}>{labelText}</Label>}
          {/* TODO: is it on purpose that aria-labelledby isn't passed through? */}
          {showValueLabel && <Label aria-labelledby={labelProps.id}>{state.getThumbValueLabel(0)}</Label>}
        </Flex>
      }
      <div
        {...groupProps}
        className={classNames(
          styles,
          'spectrum-ColorSlider', {
            'is-disabled': isDisabled,
            'spectrum-ColorSlider--vertical': vertical
          }
        )
      }>
        <div className={classNames(styles, 'spectrum-ColorSlider-checkerboard')} role="presentation" ref={trackRef} {...trackProps}>
          <div className={classNames(styles, 'spectrum-ColorSlider-gradient')} role="presentation" {...gradientProps} />
        </div>
        <ColorThumb
          value={state.getDisplayColor()}
          isFocused={isFocused && isFocusVisible}
          isDisabled={isDisabled}
          isDragging={state.isThumbDragging(0)}
          style={{[vertical ? 'top' : 'left']: `${thumbPosition * 100}%`}}
          className={classNames(styles, 'spectrum-ColorSlider-handle')}
          {...thumbProps}>
          <input {...inputProps} {...focusProps} ref={inputRef} className={classNames(styles, 'spectrum-ColorSlider-slider')} />
        </ColorThumb>
      </div>
    </div>
  );
}

let _ColorSlider = React.forwardRef(ColorSlider);
export {_ColorSlider as ColorSlider};
