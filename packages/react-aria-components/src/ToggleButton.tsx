import {AriaToggleButtonProps, mergeProps, useFocusRing, useHover, useToggleButton} from 'react-aria';
import {ButtonRenderProps} from './Button';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {RenderProps, SlotProps, useContextProps, useRenderProps, WithRef} from './utils';
import {useToggleState} from 'react-stately';

export interface ToggleButtonRenderProps extends ButtonRenderProps {
  /**
   * Whether the button is currently selected.
   * @selector [aria-pressed=true]
   */
  isSelected: boolean
}

export interface ToggleButtonProps extends Omit<AriaToggleButtonProps, 'children' | 'elementType'>, SlotProps, RenderProps<ToggleButtonRenderProps> {}
interface ToggleButtonContextValue extends WithRef<AriaToggleButtonProps, HTMLButtonElement> {}

export const ToggleButtonContext = createContext<ToggleButtonContextValue>({});

function ToggleButton(props: ToggleButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ToggleButtonContext);
  let state = useToggleState(props);
  let {buttonProps, isPressed} = useToggleButton(props, state, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isSelected: state.isSelected, isFocusVisible, isDisabled: props.isDisabled || false},
    defaultClassName: 'react-aria-ToggleButton'
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined} />
  );
}

/**
 * A toggle button allows a user to toggle a selection on or off, for example switching between two states or modes.
 */
const _ToggleButton = forwardRef(ToggleButton);
export {_ToggleButton as ToggleButton};
