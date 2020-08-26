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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import React, {RefObject, useRef} from 'react';
import {SpectrumHexColorFieldProps} from '@react-types/color';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useHexColorField} from '@react-aria/color';
import {useHexColorFieldState} from '@react-stately/color';
import {useProviderProps} from '@react-spectrum/provider';

function HexColorField(props: SpectrumHexColorFieldProps, ref: RefObject<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    isQuiet,
    isDisabled,
    autoFocus,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);
  let state = useHexColorFieldState(otherProps);
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let {
    labelProps,
    inputFieldProps,
  } = useHexColorField(props, state);

  let className = classNames(
    inputgroupStyles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    styleProps.className
  );

  return (
    <FocusRing
      within
      focusClass={classNames(inputgroupStyles, 'is-focused')}
      focusRingClass={classNames(inputgroupStyles, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...styleProps}
        ref={ref}
        className={className}>
        <TextFieldBase
          isQuiet={isQuiet}
          inputRef={inputRef}
          labelProps={labelProps}
          inputProps={inputFieldProps} />
      </div>
    </FocusRing>
  );
}

/**
 * An input for color. Displays color value in hex format.
 */
const _HexColorField = React.forwardRef(HexColorField);
export {_HexColorField as HexColorField};
