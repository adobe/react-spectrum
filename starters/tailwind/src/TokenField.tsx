'use client';
import React from 'react';
import {
  TokenField as AriaTokenField,
  TokenInput as AriaTokenInput,
  Token as AriaToken,
  type TokenFieldProps as AriaTokenFieldProps,
  type TokenInputProps,
  type TokenProps
} from 'react-aria-components/TokenField';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {tv} from 'tailwind-variants';
import {Description, Label, fieldBorderStyles} from './Field';
import {composeTailwindRenderProps, focusRing} from './utils';

const tokenFieldStyles = tv({
  base: 'flex flex-col gap-1 font-sans'
});

const tokenInputStyles = tv({
  extend: focusRing,
  base: 'group border-1 rounded-lg font-sans text-sm py-2 px-3 [&[aria-multiline=true]]:min-h-[100px] box-border w-full transition bg-white dark:bg-neutral-900 forced-colors:bg-[Field] text-neutral-800 dark:text-neutral-200 outline-0 disabled:text-neutral-200 dark:disabled:text-neutral-600 disabled:select-none [-webkit-tap-highlight-color:transparent]',
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    isDisabled: fieldBorderStyles.variants.isDisabled
  }
});

const tokenStyles = tv({
  extend: focusRing,
  base: 'inline-flex items-center rounded-full h-5 px-2 py-px mx-0.5 cursor-default whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300 transition [-webkit-tap-highlight-color:transparent] selection:bg-transparent group-data-disabled:bg-neutral-100 group-data-disabled:text-neutral-300 dark:group-data-disabled:bg-neutral-800 dark:group-data-disabled:text-neutral-600 forced-colors:group-data-disabled:text-[GrayText]',
  variants: {
    isSelected: {
      true: 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-color-adjust-none'
    }
  }
});

export interface TokenFieldProps extends Omit<AriaTokenFieldProps, 'children'> {
  label?: string;
  description?: string;
  inputRef?: React.Ref<HTMLDivElement>;
  children: TokenInputProps['children'];
}

export function TokenField({
  label,
  description,
  className,
  inputRef,
  children,
  ...props
}: TokenFieldProps) {
  return (
    <AriaTokenField
      {...props}
      className={composeTailwindRenderProps(className, tokenFieldStyles())}>
      {label && <Label>{label}</Label>}
      <AriaTokenInput ref={inputRef} className={tokenInputStyles}>
        {children}
      </AriaTokenInput>
      {description && <Description>{description}</Description>}
    </AriaTokenField>
  );
}

export function Token(props: TokenProps) {
  return (
    <AriaToken
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        tokenStyles({...renderProps, className})
      )}
    />
  );
}
