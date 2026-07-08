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

import {AriaTokenFieldProps} from 'react-aria/useTokenField';
import {FieldInputContext} from './Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRefType} from '@react-types/shared';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {ForwardedRef, forwardRef, HTMLAttributes, memo} from 'react';
import {RenderProps, SlotProps, StyleRenderProps, useRenderProps, useSlottedContext} from './utils';
import {TokenSegment, TokenSegmentList, useTokenFieldState} from 'react-stately/useTokenFieldState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useToken, useTokenField} from 'react-aria/useTokenField';

export interface TokenFieldRenderProps {
  isReadOnly: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface TokenFieldProps<T extends TokenSegmentList = TokenSegmentList>
  extends AriaTokenFieldProps<T>, StyleRenderProps<TokenFieldRenderProps>, SlotProps {
  children: (
    segment: TokenSegment<T extends TokenSegmentList<infer V> ? V : never>
  ) => React.ReactElement;
}

export const TokenField = /*#__PURE__*/ (forwardRef as forwardRefType)(function TokenField<
  T extends TokenSegmentList = TokenSegmentList
>(props: TokenFieldProps<T>, forwardedRef: ForwardedRef<HTMLDivElement | null>) {
  let {
    onChange,
    children,
    isReadOnly = false,
    isDisabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy
  } = props;

  let fieldCtx = useSlottedContext(FieldInputContext, props.slot);
  let {
    value: _autocompleteValue,
    onChange: onAutocompleteChange,
    ref: autocompleteRef,
    ...autocompleteProps
  } = fieldCtx ?? {};

  let ref = useObjectRef(forwardedRef);
  let state = useTokenFieldState({
    ...props,
    onChange: (value: T) => {
      onChange?.(value);
      onAutocompleteChange?.(value.toString());
    }
  });

  let {tokenFieldProps, isComposing} = useTokenField(
    {
      ...props,
      'aria-label': ariaLabel ?? autocompleteProps['aria-label'],
      'aria-labelledby': ariaLabelledBy ?? autocompleteProps['aria-labelledby'],
      'aria-describedby': ariaDescribedBy ?? autocompleteProps['aria-describedby']
    },
    state,
    ref
  );

  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-TokenField',
    values: {
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(
        DOMProps,
        renderProps,
        focusProps,
        tokenFieldProps,
        autocompleteProps as HTMLAttributes<HTMLDivElement>
      )}
      ref={mergeRefs(ref, autocompleteRef as any)}
      role={autocompleteProps['role'] || 'textbox'}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      style={{...renderProps.style, ...tokenFieldProps.style}}>
      <CompositionRenderBlocker isComposing={isComposing}>
        {state.value.segments.map((v, i) => {
          switch (v.type) {
            case 'token': {
              let token = children(v);
              return (
                // Wrap tokens in zero-width spaces so the cursor is placed correctly.
                <span key={i}>
                  {'\u200b'}
                  {token}
                  {'\u200b'}
                </span>
              );
            }
            case 'text':
              return v.text;
          }
        })}
        {/* Force cursor to the next line if the last segment ends with a newline. */}
        {state.value.segments.at(-1)?.text.endsWith('\n') && <br />}
      </CompositionRenderBlocker>
    </div>
  );
});

export interface TokenRenderProps {
  isSelected: boolean;
  isDisabled: boolean;
}

export interface TokenProps extends RenderProps<TokenRenderProps, 'span'> {}

export const Token = forwardRef(function Token(
  props: TokenProps,
  ref: ForwardedRef<HTMLSpanElement>
) {
  let objectRef = useObjectRef(ref);
  let {tokenProps, isSelected} = useToken(props, {}, objectRef);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Token',
    values: {
      isSelected,
      isDisabled: false
    }
  });

  return (
    <span
      ref={objectRef}
      {...renderProps}
      {...tokenProps}
      data-selected={isSelected || undefined}
      style={{
        ...renderProps.style,
        ...tokenProps.style
      }}>
      {renderProps.children}
    </span>
  );
});

// Prevents React from re-rendering during composition events.
const CompositionRenderBlocker = memo(
  ({children}: {children: React.ReactNode; isComposing: boolean}) => children,
  (prevProps, nextProps) =>
    nextProps.isComposing ? true : prevProps.children === nextProps.children
);
