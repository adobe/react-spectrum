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

import {AriaLabelingProps, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  Provider,
  RACValidation,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext
} from './utils';
import {AriaFileFieldProps, useFileField} from 'react-aria/useFileField';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FormContext} from './Form';
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {Input} from './Input';
import {LabelContext} from './Label';
import {PressResponder} from 'react-aria/private/interactions/PressResponder';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useRef} from 'react';
import {TextContext} from './Text';
import {useObjectRef} from 'react-aria/useObjectRef';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface FileTriggerProps
  extends AriaLabelingProps, RACValidation, GlobalDOMAttributes<HTMLInputElement> {
  /**
   * Specifies what mime type of files are allowed.
   */
  acceptedFileTypes?: ReadonlyArray<string>;
  /**
   * Whether multiple files can be selected.
   */
  allowsMultiple?: boolean;
  /**
   * Specifies the use of a media capture mechanism to capture the media on the spot.
   */
  defaultCamera?: 'user' | 'environment';
  /**
   * Handler when a user selects a file.
   */
  onSelect?: (files: FileList | null) => void;
  /**
   * The children of the component.
   */
  children?: ReactNode;
  /**
   * Enables the selection of directories instead of individual files.
   */
  acceptDirectory?: boolean;
  /**
   * The name of the input element, used when submitting an HTML form. See the [MDN
   * docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#name) for more info.
   */
  name?: string;
  /**
   * Whether the input is disabled.
   */
  isDisabled?: boolean;
  /**
   * Whether user input is required on the input before form submission.
   */
  isRequired?: boolean;
  /**
   * Whether the input value is invalid.
   */
  isInvalid?: boolean;
}

/**
 * A FileTrigger allows a user to access the file system with any pressable React Aria or React
 * Spectrum component, or custom components built with usePress.
 */
export const FileTrigger = forwardRef(function FileTrigger(
  props: FileTriggerProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  let {
    onSelect,
    acceptedFileTypes,
    allowsMultiple,
    defaultCamera,
    children,
    acceptDirectory,
    name,
    isDisabled,
    isInvalid,
    ...rest
  } = props;
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let inputRef = useObjectRef(ref);
  let domProps = filterDOMProps(rest, {global: true, labelable: true});

  return (
    <>
      <PressResponder
        onPress={() => {
          if (isDisabled) {
            return;
          }
          if (inputRef.current?.value) {
            inputRef.current.value = '';
          }
          inputRef.current?.click();
        }}>
        {children}
      </PressResponder>
      <VisuallyHidden>
        <Input
          {...domProps}
          className=""
          type="file"
          ref={inputRef}
          tabIndex={-1}
          accept={acceptedFileTypes?.toString()}
          onChange={e => onSelect?.(getEventTarget(e).files)}
          capture={defaultCamera}
          multiple={allowsMultiple}
          name={name}
          disabled={isDisabled}
          required={props.isRequired && validationBehavior === 'native'}
          aria-required={(props.isRequired && validationBehavior === 'aria') || undefined}
          aria-invalid={isInvalid || undefined}
          // @ts-expect-error
          webkitdirectory={acceptDirectory ? '' : undefined}
        />
      </VisuallyHidden>
    </>
  );
});

export interface FileFieldRenderProps {
  /**
   * Whether the file field is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the file field is invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the file field is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
}

export interface FileFieldProps
  extends
    Omit<
      AriaFileFieldProps,
      'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'
    >,
    RACValidation,
    RenderProps<FileFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * Specifies what mime type of files are allowed.
   */
  acceptedFileTypes?: ReadonlyArray<string>;
  /**
   * Whether multiple files can be selected.
   */
  allowsMultiple?: boolean;
  /**
   * Specifies the use of a media capture mechanism to capture the media on the spot.
   */
  defaultCamera?: 'user' | 'environment';
  /**
   * Enables the selection of directories instead of individual files.
   */
  acceptDirectory?: boolean;
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-FileField'
   */
  className?: ClassNameOrFunction<FileFieldRenderProps>;
}

export const FileFieldContext = createContext<ContextValue<FileFieldProps, HTMLDivElement>>(null);

/**
 * A FileField allows a user to select a file from their local file system as part of an HTML
 * form, and composes with Label and FieldError to support validation.
 */
export const FileField = /*#__PURE__*/ (forwardRef as forwardRefType)(function FileField(
  props: FileFieldProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, FileFieldContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);
  let {labelProps, triggerProps, descriptionProps, errorMessageProps, ...validation} = useFileField(
    {
      ...props,
      label,
      validationBehavior
    },
    inputRef
  );

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled: props.isDisabled || false,
      isRequired: props.isRequired || false,
      isInvalid: validation.isInvalid
    },
    defaultClassName: 'react-aria-FileField'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  return (
    <dom.div
      {...DOMProps}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-invalid={validation.isInvalid || undefined}
      data-required={props.isRequired || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps,
                errorMessage: errorMessageProps
              }
            }
          ],
          [FieldErrorContext, validation]
        ]}>
        <FileTrigger
          {...triggerProps}
          ref={inputRef}
          acceptedFileTypes={props.acceptedFileTypes}
          allowsMultiple={props.allowsMultiple}
          defaultCamera={props.defaultCamera}
          acceptDirectory={props.acceptDirectory}
          validationBehavior={validationBehavior}>
          {renderProps.children}
        </FileTrigger>
      </Provider>
    </dom.div>
  );
});
