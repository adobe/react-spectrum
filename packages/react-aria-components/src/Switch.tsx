import {AriaSwitchProps, mergeProps, useFocusRing, useHover, usePress, useSwitch, VisuallyHidden} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, useState} from 'react';
import {RenderProps, useContextProps, useRenderProps, WithRef} from './utils';
import {useToggleState} from 'react-stately';

interface SwitchProps extends Omit<AriaSwitchProps, 'children'>, RenderProps<SwitchRenderProps> {}

export interface SwitchRenderProps {
  /**
   * Whether the switch is selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the switch is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the switch is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the switch is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the switch is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the switch is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the switch is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean
}

export const SwitchContext = createContext<WithRef<AriaSwitchProps, HTMLInputElement>>(null);

function Switch(props: SwitchProps, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, SwitchContext);
  let state = useToggleState(props);
  let {inputProps, isSelected, isDisabled, isReadOnly, isPressed: isPressedKeyboard} = useSwitch(props, state, ref);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isInteractionDisabled = props.isDisabled || props.isReadOnly;

  // Handle press state for full label. Keyboard press state is returned by useSwitch
  // since it is handled on the <input> element itself.
  let [isPressed, setPressed] = useState(false);
  let {pressProps} = usePress({
    isDisabled: isInteractionDisabled,
    onPressStart(e) {
      if (e.pointerType !== 'keyboard') {
        setPressed(true);
      }
    },
    onPressEnd(e) {
      if (e.pointerType !== 'keyboard') {
        setPressed(false);
      }
    }
  });

  let {hoverProps, isHovered} = useHover({
    isDisabled: isInteractionDisabled
  });

  let pressed = isInteractionDisabled ? false : (isPressed || isPressedKeyboard);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Switch',
    values: {
      isSelected,
      isPressed: pressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly
    }
  });

  return (
    <label 
      {...mergeProps(pressProps, hoverProps, renderProps)}
      data-selected={isSelected || undefined}
      data-pressed={pressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      {renderProps.children}
    </label>
  );
}

const _Switch = forwardRef(Switch);
export {_Switch as Switch};
