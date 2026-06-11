'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useButton, type AriaButtonProps} from 'react-aria/useButton';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useRef} from 'react';
import './Button.css';

interface ButtonProps extends AriaButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet';
}

export function Button({variant = 'primary', ...props}: ButtonProps) {
  let ref = useRef<HTMLButtonElement>(null);
  let {buttonProps, isPressed} = useButton(props, ref);
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      className="react-aria-Button button-base"
      data-variant={variant}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}>
      {props.children}
    </button>
  );
}
