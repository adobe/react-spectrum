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

// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import {OuterField} from './OuterField';
import React, {RefObject, useRef} from 'react';
import {ReadOnlyField} from './ReadOnlyField';
import {SpectrumFieldProps} from '@react-types/label';
import {useFormProps} from '@react-spectrum/form';
import {useMessageFormatter} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/utils';

function Field(props: SpectrumFieldProps, ref: RefObject<HTMLElement>) {
  props = useFormProps(props);
  let {
    label,
    validationState,
    description,
    errorMessage,
    children,
    readOnlyText,
    isReadOnly,
    inputRef,

    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let hasHelpText = !!description || errorMessage && validationState === 'invalid';
  let formatMessage = useMessageFormatter(intlMessages);
  let displayReadOnly = isReadOnly && (readOnlyText || readOnlyText === '');
  let defaultInputRef = useRef<HTMLTextAreaElement>(null);
  inputRef = inputRef || defaultInputRef;

  if (displayReadOnly) {
    if (readOnlyText === '') {
      readOnlyText = formatMessage('(None)');
    }
    
    children = (
      <ReadOnlyField
        {...props} 
        readOnlyText={readOnlyText}
        displayReadOnly={displayReadOnly}
        hasHelpText={hasHelpText}
        styleProps={styleProps}
        inputRef={inputRef as RefObject<HTMLTextAreaElement>} 
        ref={ref as RefObject<HTMLDivElement>} />
    );

    if (label) {
      return children;
    }
  }

  if (!displayReadOnly && (label || hasHelpText)) {
    return (
      <OuterField
        {...props}
        ref={ref as RefObject<HTMLDivElement>}
        displayReadOnly={displayReadOnly}
        styleProps={styleProps}
        hasHelpText={hasHelpText}>
        {children}
      </OuterField>
    );
  }

  return React.cloneElement(children, mergeProps(children.props, {
    ...styleProps,
    // @ts-ignore
    ref: mergeRefs(children.ref, ref)
  }));
}

let _Field = React.forwardRef(Field);
export {_Field as Field};
