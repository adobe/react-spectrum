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
import {FieldWrapper} from './FieldWrapper';
import {FocusRing} from '@react-aria/focus'; 
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, RefObject, useCallback} from 'react';
import {SpectrumFieldProps} from '@react-types/label';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useFormProps} from '@react-spectrum/form';
import {useHover} from '@react-aria/interactions';
import {useLayoutEffect} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

interface ReadOnlyFieldProps extends SpectrumFieldProps {
  styleProps?: HTMLAttributes<HTMLElement>
}

function ReadOnlyField(props: ReadOnlyFieldProps, ref: RefObject<HTMLDivElement>) {
  props = useFormProps(props);
  let {
    isDisabled,
    readOnlyText,
    autoFocus,
    inputRef,
    label,
    styleProps
  } = props;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {labelProps, inputProps} = useTextField({
    ...props,
    validationState: undefined,
    inputElementType: 'textarea'
  }, inputRef as RefObject<HTMLTextAreaElement>);
  delete inputProps.defaultValue;

  let onHeightChange = useCallback(() => {
    let input = inputRef.current;
    let prevAlignment = input.style.alignSelf;
    input.style.alignSelf = 'start';
    input.style.height = 'auto'; 
    input.style.height = `${input.scrollHeight}px`;
    input.style.alignSelf = prevAlignment;
  }, [inputRef]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, readOnlyText, inputRef, styleProps]);

  if (readOnlyText === '') {
    readOnlyText = stringFormatter.format('(None)');
  }
  
  let textfield = (
    <div
      className={
        classNames(
          styles,
          'spectrum-Textfield',
          {
            'spectrum-Textfield--quiet': true,
            'spectrum-Textfield--readonly': true
          }
        )
      }>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} isTextInput autoFocus={autoFocus}>        
        <textarea
          {...mergeProps(inputProps, hoverProps)} 
          rows={1}
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          value={readOnlyText}
          className={
            classNames(
              styles,
              'spectrum-Textfield-input',
              {
                'is-hovered': isHovered
              }
            )
        } />
      </FocusRing> 
    </div>);

  if (!label) {
    return React.cloneElement(textfield, mergeProps(textfield.props, {
      ...styleProps,
      ref
    }));
  }

  return (
    <FieldWrapper 
      {...props}
      ref={ref}
      labelProps={labelProps}
      elementType="label"
      displayReadOnly
      styleProps={styleProps}>
      {textfield}
    </FieldWrapper>
  );
}

let _ReadOnlyField = React.forwardRef(ReadOnlyField);
export {_ReadOnlyField as ReadOnlyField};
