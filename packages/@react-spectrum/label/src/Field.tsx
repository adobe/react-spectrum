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

import {FieldWrapper} from './FieldWrapper';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {ForwardedRef, ReactElement, RefObject, useCallback, useRef} from 'react';
import {ReadOnlyField} from './ReadOnlyField';
import {SpectrumFieldProps} from '@react-types/label';
import {useFormProps} from '@react-spectrum/form';
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
  let hasHelpText = !!description || (errorMessage && validationState === 'invalid');
  let displayReadOnly = isReadOnly && (!!readOnlyText || readOnlyText === '');
  let mergedRefs = useMergeRefs((children as ReactElement & {ref: RefObject<HTMLElement>}).ref, ref);
  let defaultInputRef = useRef<HTMLTextAreaElement>(null);
  inputRef = inputRef || defaultInputRef;

  if (displayReadOnly) {

    children = (
      <ReadOnlyField
        {...props} 
        readOnlyText={readOnlyText}
        styleProps={styleProps}
        inputRef={inputRef as RefObject<HTMLTextAreaElement>} 
        ref={ref as RefObject<HTMLDivElement>} />
    );
  }

  if (!displayReadOnly && (label || hasHelpText)) {
    return (
      <FieldWrapper
        {...props}
        ref={ref as RefObject<HTMLDivElement>}
        displayReadOnly={displayReadOnly}
        styleProps={styleProps}
        hasHelpText={hasHelpText}>
        {children}
      </FieldWrapper>
    );
  }

  /*
  If a Field doesn't have a label, we need to merge the child ref with 
  the DOM ref provided by the user since they point to the same DOM node
  */ 
  return React.cloneElement(children, mergeProps(children.props, {
    ...styleProps,
    ref: mergedRefs
  }));
}

function useMergeRefs<T>(...refs: ForwardedRef<T>[]): (instance: (T | null)) => void {
  return useCallback(
    mergeRefs(...refs) as (instance: (T | null)) => void,
    [...refs]
  );
}

let _Field = React.forwardRef(Field);
export {_Field as Field};
