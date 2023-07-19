import {ContextValue, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {InputRenderProps} from './Input';
import {mergeProps, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, TextareaHTMLAttributes} from 'react';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'>, StyleRenderProps<InputRenderProps> {}

export const TextAreaContext = createContext<ContextValue<TextAreaProps, HTMLTextAreaElement>>({});

function TextArea(props: TextAreaProps, ref: ForwardedRef<HTMLTextAreaElement>) {
  [props, ref] = useContextProps(props, ref, TextAreaContext);

  let {hoverProps, isHovered} = useHover({});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    isTextInput: true,
    autoFocus: props.autoFocus
  });

  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocused, isFocusVisible, isDisabled: props.disabled || false},
    defaultClassName: 'react-aria-TextArea'
  });

  return (
    <textarea
      {...mergeProps(props, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined} />
  );
}
/**
 * A textarea allows a user to input mult-line text.
 */
const _TextArea = forwardRef(TextArea);
export {_TextArea as TextArea};
