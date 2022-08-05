import {AriaButtonProps, mergeProps, useButton, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {RenderProps, SlotProps, useContextProps, useRenderProps, WithRef} from './utils';

export interface ButtonRenderProps {
  isHovered: boolean,
  isPressed: boolean,
  isFocused: boolean,
  isFocusVisible: boolean
}

interface ButtonProps extends Omit<AriaButtonProps, 'children'>, SlotProps, RenderProps<ButtonRenderProps> {}

export const ButtonContext = createContext<WithRef<AriaButtonProps, HTMLButtonElement>>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  let {buttonProps, isPressed} = useButton(props, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isFocusVisible}
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {props.children}
    </button>
  );
}

const _Button = forwardRef(Button);
export {_Button as Button};
