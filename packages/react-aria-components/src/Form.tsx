/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AlertContext} from './Alert';
import {ContextValue, dom, Provider, RenderProps, useContextProps, useRenderProps} from './utils';
import {FormValidationContext} from 'react-stately/private/form/useFormValidationState';
import {GlobalDOMAttributes, FormProps as SharedFormProps} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, useMemo} from 'react';
import {useAction} from 'react-stately/private/utils/useAction';

export interface FormProps extends SharedFormProps, RenderProps<FormRenderProps, 'form'>, GlobalDOMAttributes<HTMLFormElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element.
   * @default 'react-aria-Form'
   */
  className?: string,
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when a field value is missing or invalid, or mark fields as required
   * or invalid via ARIA.
   * @default 'native'
   */
  validationBehavior?: 'aria' | 'native',
  /**
   * Async action that is called when the value changes.
   * This differs from the React's `action` prop in a few ways:
   * 
   * * Errors thrown during the action are caught and passed to the `actionError` render prop.
   * * The pending state is automatically passed to the form's submit button.
   * * The form is not automatically reset after the action completes.
   */
  submitAction?: (data: FormData) => void | Promise<void>
}

export interface FormRenderProps {
  /**
   * Whether the form's submit action is pending.
   * @selector [data-pending]
   */
  isPending: boolean,
  /**
   * The last error that occurred within the form's submit action.
   * @selector [data-action-error]
   */
  actionError: unknown | null
}

export const FormContext = createContext<ContextValue<FormProps, HTMLFormElement>>(null);
export const FormPendingContext = createContext<boolean>(false);

/**
 * A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors.
 */
export const Form = forwardRef(function Form(props: FormProps, ref: ForwardedRef<HTMLFormElement>) {
  [props, ref] = useContextProps(props, ref, FormContext);
  let {validationErrors, validationBehavior = 'native', render, children, className, style, submitAction, action, onSubmit, ...domProps} = props;

  let [onAction, isPending, actionError] = useAction(submitAction);
  let [formError, fieldErrors] = useMemo(() => {
    // Support errors from libraries conforming to the Standard Schema spec: https://standardschema.dev/schema
    if (actionError && typeof actionError === 'object' && Array.isArray(actionError['issues'])) {
      let formErrors: string[] = [];
      let fieldErrors: Record<string, string[]> = {};
      for (let issue of actionError['issues']) {
        if (
          issue &&
          typeof issue === 'object' &&
          typeof issue.message === 'string'
        ) {
          if (Array.isArray(issue.path) && issue.path.length > 0 && typeof issue.path[0] === 'string') {
            fieldErrors[issue.path[0]] ||= [];
            fieldErrors[issue.path[0]].push(issue.message);
          } else {
            formErrors.push(issue.message);
          }
        }
      }

      return [formErrors.length > 0 ? formErrors : null, fieldErrors];

    // Alternative error shape based on Zod's flattenError result: https://zod.dev/error-formatting#zflattenerror
    } else if (actionError && typeof actionError === 'object' && (actionError['formErrors'] || actionError['fieldErrors'])) {
      return [actionError['formErrors'], actionError['fieldErrors']];
    }

    return [actionError, null];
  }, [actionError]);

  let renderProps = useRenderProps({
    children,
    className,
    style,
    render,
    defaultClassName: 'react-aria-Form',
    values: {
      isPending,
      actionError: formError
    }
  });

  return (
    <dom.form
      noValidate={validationBehavior !== 'native'}
      {...domProps}
      {...renderProps}
      ref={ref}
      data-pending={isPending || undefined}
      data-action-error={!!formError || undefined}
      action={action}
      onSubmit={e => {
        onSubmit?.(e);
        if (onAction) {
          e.preventDefault();
          onAction(new FormData(e.currentTarget));
        }
      }}>
      <Provider
        values={[
          [FormContext, {...props, validationBehavior}],
          [FormValidationContext, validationErrors ?? fieldErrors ?? {}],
          [AlertContext, {autoFocus: !!formError}],
          [FormPendingContext, isPending]
        ]}>
        {renderProps.children}
      </Provider>
    </dom.form>
  );
});
