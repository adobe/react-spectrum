'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useToggleButton, type AriaToggleButtonProps} from 'react-aria/useToggleButton';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useToggleState} from 'react-stately/useToggleState';
import {useRef} from 'react';
import './ToggleButton.css';

interface ToggleButtonProps extends AriaToggleButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet';
}

export function ToggleButton({variant = 'primary', ...props}: ToggleButtonProps) {
  let ref = useRef<HTMLButtonElement>(null);
  let state = useToggleState(props);
  /*- begin highlight -*/
  let {buttonProps, isPressed} = useToggleButton(props, state, ref);
  /*- end highlight -*/
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      className="react-aria-ToggleButton button-base"
      data-variant={variant}
      data-selected={state.isSelected || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}>
      <span>{props.children}</span>
    </button>
  );
}
