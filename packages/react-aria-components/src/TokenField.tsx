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
  ContextValue,
  dom,
  Provider,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext
} from './utils';
import {createHideableComponent} from 'react-aria/private/collections/Hidden';
import {FieldInputContext} from './Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {HoverProps, useHover} from 'react-aria/useHover';
import {LabelContext} from './Label';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  memo,
  RefObject,
  useContext,
  useMemo
} from 'react';
import {TextContext} from './Text';
import {
  TokenFieldState,
  TokenSegment,
  TokenSegmentList,
  useTokenFieldState
} from 'react-stately/useTokenFieldState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useToken, useTokenField} from 'react-aria/useTokenField';

export interface TokenFieldRenderProps {
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
  extends
    AriaTokenFieldProps<T>,
    RenderProps<TokenFieldRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-TokenField'
   */
  className?: ClassNameOrFunction<TokenFieldRenderProps>;
}

export interface TokenInputRenderProps {
  /**
   * Whether the token input is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the token input is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the token input is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the token input is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the token input is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
}

export interface TokenInputProps<T extends TokenSegmentList = TokenSegmentList>
  extends
    HoverProps,
    StyleRenderProps<TokenInputRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
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
   * @default 'react-aria-TokenInput'
   */
  className?: ClassNameOrFunction<TokenInputRenderProps>;
}

interface TokenInputContextValue<T extends TokenSegmentList = TokenSegmentList> {
  tokenFieldProps: HTMLAttributes<HTMLDivElement>;
  isComposing: boolean;
  state: TokenFieldState<T>;
  isDisabled: boolean;
  isReadOnly: boolean;
  autocompleteProps?: HTMLAttributes<HTMLDivElement>;
  ref: RefObject<HTMLDivElement | null>;
}

export const TokenFieldContext = createContext<ContextValue<TokenFieldProps, HTMLDivElement>>(null);
const TokenInputContext = createContext<TokenInputContextValue | null>(null);

/**
 * A token field allows users to enter text with inline tokens. Use it to build AI prompt fields,
 * tag inputs, structured search fields, mention inputs, and multi-select comboboxes.
 */
export const TokenField = /*#__PURE__*/ createHideableComponent(function TokenField<
  T extends TokenSegmentList = TokenSegmentList
>(props: TokenFieldProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TokenFieldContext);
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);

  let fieldCtx = useSlottedContext(FieldInputContext, props.slot);
  let {
    value: _autocompleteValue,
    onChange: onAutocompleteChange,
    ref: autocompleteRef,
    ...autocompleteProps
  } = fieldCtx ?? {};
  let inputRef = useObjectRef(autocompleteRef);

  let isDisabled = props.isDisabled || false;
  let isReadOnly = props.isReadOnly || false;

  let state = useTokenFieldState<T>({
    ...props,
    onChange: (value: T) => {
      props.onChange?.(value);
      onAutocompleteChange?.(value.toString());
    }
  });

  let {tokenFieldProps, labelProps, descriptionProps, isComposing} = useTokenField(
    {
      ...props,
      // @ts-ignore - not a public prop, used to determine if slot is present
      label,
      role: props.role || autocompleteProps['role'] || 'textbox'
    },
    state,
    inputRef
  );

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled,
      isReadOnly
    },
    defaultClassName: 'react-aria-TokenField'
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <dom.div
      {...DOMProps}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, elementType: 'span', ref: labelRef}],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps
              }
            }
          ],
          [
            TokenInputContext,
            {
              tokenFieldProps,
              isComposing,
              state,
              isDisabled,
              isReadOnly,
              autocompleteProps: autocompleteProps as HTMLAttributes<HTMLDivElement>,
              ref: inputRef as RefObject<HTMLDivElement | null>
            }
          ]
        ]}>
        {renderProps.children}
      </Provider>
    </dom.div>
  );
});

/**
 * A token input represents the editable area within a token field.
 */
export const TokenInput = /*#__PURE__*/ (forwardRef as forwardRefType)(function TokenInput<
  T extends TokenSegmentList = TokenSegmentList
>(props: TokenInputProps<T>, forwardedRef: ForwardedRef<HTMLDivElement | null>) {
  let {
    tokenFieldProps,
    isComposing,
    state,
    isDisabled = false,
    isReadOnly = false,
    autocompleteProps,
    ref: contextRef
  } = useContext(TokenInputContext)!;
  let ref = useMemo(() => mergeRefs(contextRef, forwardedRef), [contextRef, forwardedRef]);
  let {children, ...domProps} = props;

  let {isHovered, hoverProps} = useHover(domProps);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  let renderProps = useRenderProps({
    ...domProps,
    defaultClassName: 'react-aria-TokenInput',
    values: {
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly
    }
  });

  let DOMProps = filterDOMProps(domProps, {global: true});

  return (
    <dom.div
      {...mergeProps(
        DOMProps,
        renderProps,
        focusProps,
        hoverProps,
        tokenFieldProps,
        autocompleteProps
      )}
      ref={ref}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      style={{...renderProps.style, ...tokenFieldProps?.style}}>
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
    </dom.div>
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

export interface TokenProps
  extends RenderProps<TokenRenderProps, 'span'>, GlobalDOMAttributes<HTMLSpanElement> {
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
  let {isDisabled} = useContext(TokenInputContext)!;
  let objectRef = useObjectRef(ref);
  let {tokenProps, isSelected} = useToken(props, {}, objectRef);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Token',
    values: {
      isSelected,
      isDisabled
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <dom.span
      ref={objectRef}
      {...mergeProps(DOMProps, renderProps, tokenProps)}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      style={{
        ...renderProps.style,
        ...tokenProps.style
      }}>
      {renderProps.children}
    </dom.span>
  );
});

// Prevents React from re-rendering during composition events.
const CompositionRenderBlocker = memo(
  ({children}: {children: React.ReactNode; isComposing: boolean}) => children,
  (prevProps, nextProps) =>
    nextProps.isComposing ? true : prevProps.children === nextProps.children
);
