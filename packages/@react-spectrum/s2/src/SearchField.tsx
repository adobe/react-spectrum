/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from './ActionButton';
import {
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  ContextValue,
  Provider
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {ClearButton} from './ClearButton';
import {createContext, forwardRef, Ref, useContext, useEffect, useImperativeHandle, useRef} from 'react';
import {createFocusableRef} from '@react-spectrum/utils';
import {field, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {fontRelative, style} from '../style' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {IconContext} from './Icon';
import {mergeProps} from 'react-aria';
import {raw} from '../style/style-macro' with {type: 'macro'};
import SearchIcon from '../s2wf-icons/S2_Icon_Search_20_N.svg';
import {TextFieldRef} from '@react-types/textfield';
import {useControlledState} from '@react-stately/utils';
import {useFocus} from '@react-aria/interactions';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The size of the SearchField.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the search field is minimized (controlled). */
  isMinimized?: boolean,
  /**
   * Whether the search field is minimized by default (uncontrolled).
   *
   * @default false
   */
  defaultMinimized?: boolean,
  /** Handler that is called when the minimized state changes. */
  onMinimizeChange?: (isMinimized: boolean) => void
}

export const SearchFieldContext = createContext<ContextValue<Partial<SearchFieldProps>, TextFieldRef>>(null);

/**
 * A SearchField is a text field designed for searches.
 */
export const SearchField = /*#__PURE__*/ forwardRef(function SearchField(props: SearchFieldProps, ref: Ref<TextFieldRef>) {
  [props, ref] = useSpectrumContextProps(props, ref, SearchFieldContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    UNSAFE_className = '',
    UNSAFE_style,
    isMinimized: isMinimizedProp,
    defaultMinimized = false,
    onMinimizeChange,
    ...searchFieldProps
  } = props;

  let [isMinimized, setIsMinimized] = useControlledState(isMinimizedProp, defaultMinimized, onMinimizeChange);

  let domRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the field is expanded.
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  let {focusProps} = useFocus({
    onBlur: () => {
      // Minimize the field when it loses focus and is empty (if minimization is enabled)
      if ((isMinimizedProp !== undefined || defaultMinimized) && inputRef.current?.value === '') {
        setIsMinimized(true);
      }
    }
  });

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));

  if (isMinimized) {
    return (
      <ActionButton
        styles={style({marginStart: '[10px]'})}
        aria-label={typeof label === 'string' ? label : props['aria-label'] || 'Search'}
        size={props.size}
        isQuiet
        isDisabled={props.isDisabled}
        onPress={() => setIsMinimized(false)}>
        <SearchIcon />
      </ActionButton>
    );
  }

  return (
    <AriaSearchField
      {...mergeProps(searchFieldProps, focusProps)}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        '--iconMargin': {
          type: 'marginTop',
          value: fontRelative(-2)
        },
        color: {
          default: 'neutral',
          isDisabled: {
            default: 'disabled',
            forcedColors: 'GrayText'
          }
        }
      }, getAllowedOverrides())({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
      {({isDisabled, isInvalid, isEmpty}) => (<>
        {label && <FieldLabel
          isDisabled={isDisabled}
          isRequired={props.isRequired}
          size={props.size}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          necessityIndicator={necessityIndicator}
          contextualHelp={props.contextualHelp}>
          {label}
        </FieldLabel>}
        <FieldGroup
          isDisabled={isDisabled}
          size={props.size}
          styles={style({
            borderRadius: 'full',
            paddingStart: 'pill',
            paddingEnd: 0
          })}>
          <Provider
            values={[
              [IconContext, {
                render: centerBaseline({
                  slot: 'icon',
                  styles: style({
                    flexShrink: 0,
                    marginEnd: 'text-to-visual',
                    '--iconPrimary': {
                      type: 'fill',
                      value: 'currentColor'
                    }
                  })
                }),
                styles: style({
                  size: fontRelative(20),
                  marginStart: '--iconMargin'
                })
              }]
            ]}>
            <SearchIcon />
          </Provider>
          <Input ref={inputRef} UNSAFE_className={raw('&::-webkit-search-cancel-button { display: none }')} />
          {!isEmpty && !searchFieldProps.isReadOnly && <ClearButton size={props.size} />}
        </FieldGroup>
        <HelpText
          size={props.size}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          description={description}>
          {errorMessage}
        </HelpText>
      </>)}
    </AriaSearchField>
  );
});
