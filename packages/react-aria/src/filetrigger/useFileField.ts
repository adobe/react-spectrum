/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AriaLabelingProps,
  DOMAttributes,
  DOMProps,
  HelpTextProps,
  LabelableProps,
  RefObject,
  Validation,
  ValidationResult
} from '@react-types/shared';
import {filterDOMProps} from '../utils/filterDOMProps';
import {mergeProps} from '../utils/mergeProps';
import {useField} from '../label/useField';
import {useFormReset} from '../utils/useFormReset';
import {useFormValidation} from '../form/useFormValidation';
import {useFormValidationState} from 'react-stately/private/form/useFormValidationState';
import {useState} from 'react';

export interface AriaFileFieldProps
  extends LabelableProps, HelpTextProps, DOMProps, AriaLabelingProps, Validation<FileList | null> {
  /**
   * HTML form input name. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#name).
   */
  name?: string;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Handler that is called when the user selects one or more files. */
  onSelect?: (files: FileList | null) => void;
}

export interface FileFieldTriggerProps extends DOMProps, AriaLabelingProps {
  /** HTML form input name. */
  name?: string;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether user input is required on the input before form submission. */
  isRequired?: boolean;
  /** Whether the input value is invalid. */
  isInvalid?: boolean;
  /** Whether to use native HTML form validation or ARIA to mark the input as required/invalid. */
  validationBehavior: 'native' | 'aria';
  /** Handler that is called when the user selects one or more files. */
  onSelect: (files: FileList | null) => void;
}

export interface FileFieldAria extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes;
  /** Props to spread onto the FileTrigger that renders the underlying hidden file input. */
  triggerProps: FileFieldTriggerProps;
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes;
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a file field, allowing users to
 * select files from their local file system as part of a form, with support for labeling,
 * descriptions, and validation errors.
 *
 * @param props - Props for the file field.
 * @param ref - Ref to the hidden file input element.
 */
export function useFileField(
  props: AriaFileFieldProps,
  ref: RefObject<HTMLInputElement | null>
): FileFieldAria {
  let {name, isDisabled = false, isRequired = false, validationBehavior = 'aria', onSelect} = props;

  let [files, setFiles] = useState<FileList | null>(null);
  let validationState = useFormValidationState({
    ...props,
    value: files
  });
  let {isInvalid, validationErrors, validationDetails} = validationState.displayValidation;
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    isInvalid,
    errorMessage: props.errorMessage || validationErrors
  });

  useFormReset(ref, null, setFiles);
  useFormValidation(props, validationState, ref);

  let domProps = filterDOMProps(props, {labelable: true});

  return {
    labelProps,
    triggerProps: mergeProps(domProps, fieldProps, {
      name,
      isDisabled,
      isRequired,
      isInvalid,
      validationBehavior,
      onSelect(selectedFiles: FileList | null) {
        setFiles(selectedFiles);
        onSelect?.(selectedFiles);
      }
    }),
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails
  };
}
