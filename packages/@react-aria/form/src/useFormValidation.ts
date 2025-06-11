/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {announce} from '@react-aria/live-announcer';
import {computeAccessibleName} from 'dom-accessibility-api';
import {FormValidationState} from '@react-stately/form';
import {getActiveElement, getOwnerDocument, useEffectEvent, useLayoutEffect} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {RefObject, Validation, ValidationResult} from '@react-types/shared';
import {setInteractionModality} from '@react-aria/interactions';
import {useEffect, useRef} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isValidatableElement(element: Element): boolean {
  return element instanceof HTMLInputElement ||
         element instanceof HTMLTextAreaElement ||
         element instanceof HTMLSelectElement;
}

interface FormValidationProps<T> extends Validation<T> {
  focus?: () => void
}

const TIMEOUT_DURATION = 250;

export function useFormValidation<T>(props: FormValidationProps<T>, state: FormValidationState, ref: RefObject<ValidatableElement | null> | undefined): void {
  let {validationBehavior, focus} = props;

  let justBlurredRef = useRef(false);
  let timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function announceErrorMessage(errorMessage: string = ''): void {
    if (timeoutIdRef.current != null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (ref && ref.current && errorMessage !== '' && (
        ref.current.contains(getActiveElement(getOwnerDocument(ref.current))) ||
        justBlurredRef.current
      )
    ) {
      timeoutIdRef.current = setTimeout(() => announce(errorMessage, 'polite'), TIMEOUT_DURATION);
    }
  }

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/form');

  // This is a useLayoutEffect so that it runs before the useEffect in useFormValidationState, which commits the validation change.
  useLayoutEffect(() => {
    if (validationBehavior === 'native' && ref?.current && !ref.current.disabled) {
      let errorMessage =
        state.realtimeValidation.isInvalid ?
        (state.realtimeValidation.validationErrors?.join(' ') || stringFormatter.format('invalidValue') || '') :
        '';
      ref.current.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
      if (!ref.current.hasAttribute('title')) {
        ref.current.title = '';
      }

      if (!state.realtimeValidation.isInvalid) {
        state.updateValidation(getNativeValidity(ref.current));
      }
    }
  });

  let onReset = useEffectEvent(() => {
    state.resetValidation();
  });

  let onInvalid = useEffectEvent((e: Event) => {
    // Only commit validation if we are not already displaying one.
    // This avoids clearing server errors that the user didn't actually fix.
    if (!state.displayValidation.isInvalid) {
      state.commitValidation();
    }

    // Auto focus the first invalid input in a form, unless the error already had its default prevented.
    let form = ref?.current?.form;
    if (!e.defaultPrevented && ref && form) {

      // Announce the current error message
      announceErrorMessage(ref?.current?.validationMessage || '');

      if (getFirstInvalidInput(form) === ref.current) {
        if (focus) {
          focus();
        } else {
          ref.current?.focus();
        }
      }

      // Always show focus ring.
      setInteractionModality('keyboard');
    }

    // Prevent default browser error UI from appearing.
    e.preventDefault();
  });

  let onChange = useEffectEvent(() => {
    state.commitValidation();
  });

  let onBlur = useEffectEvent((event: Event) => {
    const input = ref?.current;
    const relatedTarget = (event as FocusEvent).relatedTarget as Element | null;
    if (
      (!input || !input.validationMessage) ||
      (relatedTarget && isValidatableElement(relatedTarget) && (relatedTarget as ValidatableElement).validationMessage)
    ) {
      // If the input has no validation message,
      // or the relatedTarget has a validation message, don't announce the error message.
      // This prevents announcing the error message when the user is navigating
      // between inputs that may already have an error message.
      return;
    }
    justBlurredRef.current = true;
    const isRadioOrCheckbox = input.type === 'radio' || input.type === 'checkbox';
    const groupElement = isRadioOrCheckbox ? input.closest('[role="group"][aria-labelledby], [role=\'group\'][aria-label], fieldset') : undefined;
    // Announce the current error message
    const accessibleName = computeAccessibleName(groupElement || input);
    const validationMessage = input.validationMessage;
    announceErrorMessage(
      accessibleName && validationMessage ?
      stringFormatter.format(
        'reviewField',
        {
          accessibleName,
          validationMessage
        }) :
      validationMessage
    );
    justBlurredRef.current = false;
  });

  useEffect(() => {
    let input = ref?.current;
    if (!input) {
      return;
    }

    let form = input.form;
    input.addEventListener('blur', onBlur);
    input.addEventListener('invalid', onInvalid);
    input.addEventListener('change', onChange);
    form?.addEventListener('reset', onReset);
    return () => {
      if (timeoutIdRef.current != null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      justBlurredRef.current = false;
      input!.removeEventListener('blur', onBlur);
      input!.removeEventListener('invalid', onInvalid);
      input!.removeEventListener('change', onChange);
      form?.removeEventListener('reset', onReset);
    };
  }, [onBlur, onChange, onInvalid, onReset, ref, validationBehavior]);
}

function getValidity(input: ValidatableElement): ValidityState {
  // The native ValidityState object is live, meaning each property is a getter that returns the current state.
  // We need to create a snapshot of the validity state at the time this function is called to avoid unpredictable React renders.
  let validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : []
  };
}

function getFirstInvalidInput(form: HTMLFormElement): ValidatableElement | null {
  for (let i = 0; i < form.elements.length; i++) {
    let element = form.elements[i] as ValidatableElement;
    if (!element.validity.valid) {
      return element;
    }
  }

  return null;
}
