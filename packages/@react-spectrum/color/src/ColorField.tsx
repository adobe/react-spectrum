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

import {classNames} from '@react-spectrum/utils';
import {ColorChannel, SpectrumColorFieldProps} from '@react-types/color';
import {ColorFieldContext, useContextProps} from 'react-aria-components';
import React, {Ref, useRef} from 'react';
import styles from './colorfield.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {TextFieldRef} from '@react-types/textfield';
import {useColorChannelField, useColorField} from '@react-aria/color';
import {useColorChannelFieldState, useColorFieldState} from '@react-stately/color';
import {useFormProps} from '@react-spectrum/form';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

/**
 * A color field allows users to edit a hex color or individual color channel value.
 */
export const ColorField = React.forwardRef(function ColorField(props: SpectrumColorFieldProps, ref: Ref<TextFieldRef>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  [props] = useContextProps(props, null, ColorFieldContext);
  if (props.placeholder) {
    console.warn('Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/ColorField.html#help-text');
  }

  if (props.channel) {
    return <ColorChannelField {...props} channel={props.channel} forwardedRef={ref} />;
  } else {
    return <HexColorField {...props} forwardedRef={ref} />;
  }
});

interface ColorChannelFieldProps extends Omit<SpectrumColorFieldProps, 'channel'> {
  channel: ColorChannel,
  forwardedRef: Ref<TextFieldRef>
}

function ColorChannelField(props: ColorChannelFieldProps) {
  let {
    // These disabled props are handled by the state hook
    value,          // eslint-disable-line @typescript-eslint/no-unused-vars
    defaultValue,   // eslint-disable-line @typescript-eslint/no-unused-vars
    onChange,       // eslint-disable-line @typescript-eslint/no-unused-vars
    validate,       // eslint-disable-line @typescript-eslint/no-unused-vars
    forwardedRef,
    ...otherProps
  } = props;
  let {locale} = useLocale();
  let state = useColorChannelFieldState({
    ...props,
    locale
  });

  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  let result = useColorChannelField(otherProps, state, inputRef);

  return (
    <>
      <TextFieldBase
        {...otherProps}
        ref={forwardedRef}
        inputRef={inputRef}
        {...result}
        inputClassName={classNames(styles, 'react-spectrum-ColorField-input')} />
      {props.name && <input type="hidden" name={props.name} value={isNaN(state.numberValue) ? '' : state.numberValue} />}
    </>
  );
}

interface HexColorFieldProps extends SpectrumColorFieldProps {
  forwardedRef: Ref<TextFieldRef>
}

function HexColorField(props: HexColorFieldProps) {
  let {
    // These disabled props are handled by the state hook
    value,          // eslint-disable-line @typescript-eslint/no-unused-vars
    defaultValue,   // eslint-disable-line @typescript-eslint/no-unused-vars
    onChange,       // eslint-disable-line @typescript-eslint/no-unused-vars
    forwardedRef,
    ...otherProps
  } = props;
  let state = useColorFieldState(props);
  let inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  let result = useColorField(otherProps, state, inputRef);

  return (
    <TextFieldBase
      {...otherProps}
      ref={forwardedRef}
      inputRef={inputRef}
      {...result}
      inputClassName={classNames(styles, 'react-spectrum-ColorField-input')} />
  );
}
