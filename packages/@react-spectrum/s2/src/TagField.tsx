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
  TokenField as AriaTokenField,
  TokenFieldProps as AriaTokenFieldProps,
  Token,
  TokenFieldSegment,
  TokenFieldValue,
  TokenInput,
  TokenInputRenderProps,
  TokenRenderProps
} from 'react-aria-components/TokenField';
import {baseColor, size, space, style} from '../style' with {type: 'macro'};
import {ContextValue} from 'react-aria-components/slots';
import {
  control,
  controlSize,
  field,
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, useContext} from 'react';
import {css} from '../style/style-macro' with {type: 'macro'};
import {
  DOMRef,
  DOMRefValue,
  GlobalDOMAttributes,
  HelpTextProps,
  SpectrumLabelableProps
} from '@react-types/shared';
import {FieldGroup, FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {useDOMRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

/**
 * A value for a {@link TagField} that splits text into tokens on comma, space, or newline
 * boundaries. Provide it as the `defaultValue` or `value` prop to seed the field with tags.
 */
export class TagFieldValue extends TokenFieldValue {
  tokenize(text: string): TokenFieldSegment[] {
    let parts = text.split(/[,\s\u200B]/);

    let segments: TokenFieldSegment[] = parts.map((part, i) => {
      if (i === parts.length - 1 || part.length === 0) {
        return {type: 'text', text: part};
      }
      return {type: 'token', text: part};
    });

    if (parts.at(-1)?.length === 0) {
      segments.pop();
    }
    return segments;
  }

  toString(): string {
    return this.segments.map(seg => seg.text).join(', ');
  }
}

export interface TagFieldProps
  extends
    Omit<
      AriaTokenFieldProps,
      | 'allowsNewlines'
      | 'role'
      | 'children'
      | 'className'
      | 'style'
      | 'render'
      | keyof GlobalDOMAttributes
    >,
    UnsafeStyles,
    SpectrumLabelableProps,
    HelpTextProps {
  /**
   * The size of the tag field.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Whether the field is in an invalid state. */
  isInvalid?: boolean;
  /**
   * Spectrum-defined styles, returned by the `style()` macro. Set a `maxHeight` here to make the
   * field scroll once the wrapped tags exceed the given height.
   */
  styles?: StylesPropWithHeight;
}

export const TagFieldContext =
  createContext<ContextValue<Partial<TagFieldProps>, DOMRefValue<HTMLDivElement>>>(null);

const gap = {
  S: 6,
  M: 8,
  L: 12,
  XL: 16
} as const;

const itemHeight = controlSize();

// The editable area. Grows to at least one line, wraps tokens onto new lines, and centers a
// single line vertically. The FieldGroup provides the horizontal padding and border.
const inputStyles = style<TokenInputRenderProps & {size: TagFieldProps['size']}>({
  flexGrow: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  padding: 16,
  outlineStyle: 'none',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
  lineHeight: {
    size: {
      S: size(itemHeight.size.S + gap.S),
      M: size(itemHeight.default + gap.M),
      L: size(itemHeight.size.L + gap.L),
      XL: size(itemHeight.size.XL + gap.XL)
    }
  },
  marginY: {
    size: {
      S: space(-gap.S / 2),
      M: space(-gap.M / 2),
      L: space(-gap.L / 2),
      XL: space(-gap.XL / 2)
    }
  },
  color: {
    default: 'inherit',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  '--s2TagFieldPlaceholder': {
    type: 'color',
    value: {
      default: 'gray-600',
      forcedColors: 'GrayText'
    }
  }
});

// Show the placeholder via a pseudo-element when the input is empty (contentEditable elements
// don't support the native placeholder attribute). The color is set by inputStyles above.
const placeholderStyles = css(`
  &:empty::before{
    content: attr(data-placeholder);
    color: var(--s2TagFieldPlaceholder);
  }
`);

// FieldGroup overrides so the field grows with wrapped tags and scrolls once it hits a max height.
const fieldGroupStyles = style({
  height: 'auto',
  minHeight: 0,
  alignSelf: 'stretch',
  alignItems: 'start',
  padding: 0,
  overflowY: 'auto'
});

// A token styled like an S2 Tag, without a remove button.
const tokenStyles = style<TokenRenderProps & {size: TagFieldProps['size']}>({
  ...control({shape: 'default', icon: true}),
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'baseline',
  boxSizing: 'border-box',
  maxWidth: 'full',
  borderStyle: 'none',
  marginEnd: {
    size: {
      S: size(gap.S),
      M: gap.M,
      L: gap.L,
      XL: gap.XL
    }
  },
  transition: 'default',
  backgroundColor: {
    default: baseColor('gray-100'),
    isSelected: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonFace',
      isSelected: 'Highlight'
    }
  },
  color: {
    default: baseColor('neutral'),
    isSelected: 'gray-25',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isSelected: 'HighlightText',
      isDisabled: 'GrayText'
    }
  },
  cursor: 'default'
});

/**
 * A TagField allows users to enter a list of tags, keywords, or categories. Tags wrap onto
 * multiple lines as they are added, and the field scrolls once it reaches a maximum height.
 */
export const TagField = forwardRef(function TagField(
  props: TagFieldProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, TagFieldContext);
  let domRef = useDOMRef(ref);
  let formContext = useContext(FormContext);
  // oxlint-disable-next-line react/react-compiler
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    placeholder,
    necessityIndicator,
    labelPosition = 'top',
    labelAlign = 'start',
    isInvalid = false,
    isDisabled,
    isRequired,
    size = 'M',
    contextualHelp,
    value,
    defaultValue,
    UNSAFE_style,
    UNSAFE_className = '',
    styles,
    ...tokenFieldProps
  } = props;

  // Default to a TagFieldValue so typed text tokenizes on comma/space/newline out of the box.
  if (value == null && defaultValue == null) {
    defaultValue = new TagFieldValue([]);
  }

  return (
    <AriaTokenField
      {...tokenFieldProps}
      ref={domRef}
      value={value}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      allowsNewlines
      style={UNSAFE_style}
      className={
        UNSAFE_className +
        style(field(), getAllowedOverrides({height: true}))(
          {
            size,
            labelPosition,
            isInForm: !!formContext
          },
          styles
        )
      }>
      <FieldLabel
        isDisabled={isDisabled}
        isRequired={isRequired}
        size={size}
        labelPosition={labelPosition}
        labelAlign={labelAlign}
        necessityIndicator={necessityIndicator}
        contextualHelp={contextualHelp}>
        {label}
      </FieldLabel>
      <FormContext.Provider value={{...formContext, size}}>
        <FieldGroup
          size={size}
          isInvalid={isInvalid}
          isDisabled={isDisabled}
          styles={fieldGroupStyles}>
          <TokenInput
            data-placeholder={placeholder}
            className={renderProps =>
              inputStyles({...renderProps, size}) + (placeholder ? ' ' + placeholderStyles : '')
            }>
            {segment => (
              <Token className={renderProps => tokenStyles({...renderProps, size})}>
                {segment.text}
              </Token>
            )}
          </TokenInput>
        </FieldGroup>
      </FormContext.Provider>
      <HelpText size={size} isDisabled={isDisabled} isInvalid={isInvalid} description={description}>
        {errorMessage}
      </HelpText>
    </AriaTokenField>
  );
});
