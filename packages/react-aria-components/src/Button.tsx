import {AriaButtonProps, mergeProps, useButton, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {RenderProps, SlotProps, useContextProps, useRenderProps, WithRef} from './utils';

export interface ButtonRenderProps {
  /**
   * Whether the button is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the button is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

interface ButtonProps extends Omit<AriaButtonProps, 'children'>, SlotProps, RenderProps<ButtonRenderProps> {}
interface ButtonContextValue extends WithRef<AriaButtonProps, HTMLButtonElement> {
  isPressed?: boolean
}

export const ButtonContext = createContext<ButtonContextValue>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  let {isPressed: isPressedContext} = useContext(ButtonContext);
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
      data-pressed={isPressedContext || isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {props.children}
    </button>
  );
}

const _Button = forwardRef(Button);
export {_Button as Button};
