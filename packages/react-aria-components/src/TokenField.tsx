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
import {
  ClassNameOrFunction,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  useRenderProps,
  useSlottedContext
} from './utils';
import {FieldInputContext} from './Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRefType} from '@react-types/shared';
import {HoverProps, useHover} from 'react-aria/useHover';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {ForwardedRef, forwardRef, HTMLAttributes, memo} from 'react';
import {TokenSegment, TokenSegmentList, useTokenFieldState} from 'react-stately/useTokenFieldState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useToken, useTokenField} from 'react-aria/useTokenField';

export interface TokenFieldRenderProps {
  /**
   * Whether the token field is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the token field is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the token field is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the token field is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the token field is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface TokenFieldProps<T extends TokenSegmentList = TokenSegmentList>
  extends AriaTokenFieldProps<T>, HoverProps, StyleRenderProps<TokenFieldRenderProps>, SlotProps {
  /**
   * A function that renders a token for each segment in the token field.
   */
  children: (
    segment: TokenSegment<T extends TokenSegmentList<infer V> ? V : never>
  ) => React.ReactElement;
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TokenField'
   */
  className?: ClassNameOrFunction<TokenFieldRenderProps>;
}

/**
 * A token field allows users to enter text with inline tokens. Use it to build AI prompt fields,
 * tag inputs, structured search fields, mention inputs, and multi-select comboboxes.
 */
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
      role: props.role || autocompleteProps['role'] || 'textbox',
      'aria-label': ariaLabel ?? autocompleteProps['aria-label'],
      'aria-labelledby': ariaLabelledBy ?? autocompleteProps['aria-labelledby'],
      'aria-describedby': ariaDescribedBy ?? autocompleteProps['aria-describedby']
    },
    state,
    ref
  );

  let {isHovered, hoverProps} = useHover(props);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-TokenField',
    values: {
      isHovered,
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
        hoverProps,
        tokenFieldProps,
        autocompleteProps as HTMLAttributes<HTMLDivElement>
      )}
      ref={mergeRefs(ref, autocompleteRef as any)}
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
  /**
   * Whether the token is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the token is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface TokenProps extends RenderProps<TokenRenderProps, 'span'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Token'
   */
  className?: ClassNameOrFunction<TokenRenderProps>;
}

/**
 * A token represents an inline segment within a token field.
 */
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
      isDisabled: false // TODO
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
