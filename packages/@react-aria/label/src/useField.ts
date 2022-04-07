/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {HelpTextProps, Validation} from '@react-types/shared';
import {HTMLAttributes} from 'react';
import {LabelAria, LabelAriaProps, useLabel} from './useLabel';
import {mergeProps, useSlotId} from '@react-aria/utils';

interface AriaFieldProps extends LabelAriaProps, HelpTextProps, Omit<Validation, 'isRequired'> {}

export interface FieldAria extends LabelAria {
  /** Props for the description element, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>,
  /** Props for the error message element, if any. */
  errorMessageProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the accessibility implementation for input fields.
 * Fields accept user input, gain context from their label, and may display a description or error message.
 * @param props - Props for the Field.
 */
export function useField(props: AriaFieldProps): FieldAria {
  let {description, errorMessage, validationState} = props;
  let {labelProps, fieldProps} = useLabel(props);

  let descriptionId = useSlotId([Boolean(description), Boolean(errorMessage), validationState]);
  let errorMessageId = useSlotId([Boolean(description), Boolean(errorMessage), validationState]);

  fieldProps = mergeProps(fieldProps, {
    'aria-describedby': [
      descriptionId,
      // Use aria-describedby for error message because aria-errormessage is unsupported using VoiceOver or NVDA. See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
      errorMessageId,
      props['aria-describedby']
    ].filter(Boolean).join(' ') || undefined
  });

  return {
    labelProps,
    fieldProps,
    descriptionProps: {
      id: descriptionId
    },
    errorMessageProps: {
      id: errorMessageId
    }
  };
}
