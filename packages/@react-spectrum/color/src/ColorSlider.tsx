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

import {classNames, SlotProvider, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {ColorSliderContext, useContextProps} from 'react-aria-components';
import {ColorThumb} from './ColorThumb';
import {FocusableRef} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import React, {useRef, useState} from 'react';
import {SpectrumColorSliderProps} from '@react-types/color';
import styles from '@adobe/spectrum-css-temp/components/colorslider/vars.css';
import {useColorSlider} from '@react-aria/color';
import {useColorSliderState} from '@react-stately/color';
import {useFocus, useFocusVisible} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * ColorSliders allow users to adjust an individual channel of a color value.
 */
export const ColorSlider = React.forwardRef(function ColorSlider(props: SpectrumColorSliderProps, ref: FocusableRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let inputRef = useRef(null);
  let trackRef = useRef(null);
  let domRef = useFocusableRef(ref, inputRef);
  [props, domRef] = useContextProps(props, domRef, ColorSliderContext);

  let {
    isDisabled,
    channel,
    orientation,
    label,
    showValueLabel,
    'aria-label': ariaLabel
  } = props;
  let vertical = orientation === 'vertical';

  let {styleProps} = useStyleProps(props);
  let {locale} = useLocale();

  let state = useColorSliderState({...props, locale});

  // If vertical and a label is provided, use it as an aria-label instead.
  if (vertical && label) {
    ariaLabel = ariaLabel || (typeof label === 'string' ? label : undefined);
    label = null;
  }

  // If no external label, aria-label or aria-labelledby is provided,
  // default to displaying the localized channel value.
  // Specifically check if label is undefined. If label is `null` then display no visible label.
  // A default aria-label is provided by useColorSlider in that case.
  if (label === undefined && !ariaLabel && !props['aria-labelledby'] && !vertical) {
    label = state.value.getChannelName(channel, locale);
  }

  // Show the value label by default if there is a visible label
  if (showValueLabel == null) {
    showValueLabel = !!label;
  }

  let {inputProps, thumbProps, trackProps, labelProps, outputProps} = useColorSlider({
    ...props,
    label,
    'aria-label': ariaLabel,
    trackRef,
    inputRef
  }, state);

  let {isFocusVisible} = useFocusVisible();
  let [isFocused, setIsFocused] = useState(false);
  let {focusProps} = useFocus({
    isDisabled,
    onFocusChange: setIsFocused
  });

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
      {label &&
        <div className={classNames(styles, 'spectrum-ColorSlider-labelContainer')}>
          <Label {...labelProps}>{label}</Label>
          {props.contextualHelp &&
            <SlotProvider
              slots={{
                actionButton: {
                  UNSAFE_className: classNames(styles, 'spectrum-ColorSlider-contextualHelp')
                }
              }}>
              {props.contextualHelp}
            </SlotProvider>
          }
          {showValueLabel && (
            <Label elementType="span" UNSAFE_className={classNames(styles, 'spectrum-ColorSlider-valueLabel')}>
              <output {...outputProps}>{state.value.formatChannelValue(channel, locale)}</output>
            </Label>
          )}
        </div>
      }
      <div
        {...trackProps}
        ref={trackRef}
        className={classNames(
          styles,
          'spectrum-ColorSlider', {
            'is-disabled': isDisabled,
            'spectrum-ColorSlider--vertical': vertical
          }
        )
      }>
        <ColorThumb
          value={state.getDisplayColor()}
          isFocused={isFocused && isFocusVisible}
          isDisabled={isDisabled}
          isDragging={state.isThumbDragging(0)}
          containerRef={trackRef}
          className={classNames(styles, 'spectrum-ColorSlider-handle')}
          {...thumbProps}>
          <input {...inputProps} {...focusProps} ref={inputRef} className={classNames(styles, 'spectrum-ColorSlider-slider')} />
        </ColorThumb>
      </div>
    </div>
  );
});
