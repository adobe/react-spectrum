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

import {announce} from '../live-announcer/LiveAnnouncer';
import {DOMAttributes, DOMProps, HelpTextProps, Validation} from '@react-types/shared';
import {LabelAria, LabelAriaProps, useLabel} from './useLabel';
import {mergeProps} from '../utils/mergeProps';
import {useEffect, useRef} from 'react';
import {useId, useSlotId} from '../utils/useId';

export interface AriaFieldProps extends LabelAriaProps, HelpTextProps, Omit<Validation<any>, 'isRequired'> {
  /** Whether the field action is pending. */
  isPending?: boolean
}

export interface FieldAria extends LabelAria {
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes,
  /** Props for the progress bar element shown when the action is pending. */
  progressBarProps: DOMProps
}

/**
 * Provides the accessibility implementation for input fields.
 * Fields accept user input, gain context from their label, and may display a description or error message.
 * @param props - Props for the Field.
 */
export function useField(props: AriaFieldProps): FieldAria {
  let {description, errorMessage, isInvalid, validationState} = props;
  let {labelProps, fieldProps} = useLabel(props);

  let descriptionId = useSlotId([Boolean(description), Boolean(errorMessage), isInvalid, validationState]);
  let errorMessageId = useSlotId([Boolean(description), Boolean(errorMessage), isInvalid, validationState]);
  let progressId = useId();

  fieldProps = mergeProps(fieldProps, {
    'aria-describedby': [
      descriptionId,
      // Use aria-describedby for error message because aria-errormessage is unsupported using VoiceOver or NVDA. See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
      errorMessageId,
      props['aria-describedby'],
      props.isPending ? progressId : undefined
    ].filter(Boolean).join(' ') || undefined
  });

  let wasPending = useRef(props.isPending);
  useEffect(() => {
    // Announce the progressbar when the field enters the pending state, and the field itself when it leaves the pending state.
    if (!wasPending.current && props.isPending && document.getElementById(progressId)) {
      let message = {'aria-labelledby': progressId};
      announce(message, 'assertive');
    } else if (wasPending.current && !props.isPending && fieldProps.id && document.getElementById(fieldProps.id)) {
      let message = {'aria-labelledby': fieldProps.id};
      announce(message, 'assertive');
    }
    wasPending.current = props.isPending;
  }, [props.isPending, progressId, fieldProps]);

  return {
    labelProps,
    fieldProps,
    descriptionProps: {
      id: descriptionId
    },
    errorMessageProps: {
      id: errorMessageId
    },
    progressBarProps: {
      id: progressId
    }
  };
}
