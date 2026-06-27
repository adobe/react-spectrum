'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useSwitch, type AriaSwitchProps} from 'react-aria/useSwitch';
import {useToggleState} from 'react-stately/useToggleState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';
import {useRef} from 'react';
import './Switch.css';

export function Switch(props: AriaSwitchProps) {
  let state = useToggleState(props);
  let ref = useRef<HTMLInputElement>(null);
  let {inputProps, isSelected, isPressed, isDisabled, isReadOnly, isInvalid} = useSwitch(
    props,
    state,
    ref
  );
  let {hoverProps, isHovered} = useHover({isDisabled: isDisabled || isReadOnly});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  return (
    <div className="react-aria-SwitchField" data-disabled={isDisabled || undefined}>
      {/* The label wraps a visually hidden native input plus the styled track/handle. */}
      <label
        {...hoverProps}
        className="react-aria-SwitchButton"
        data-selected={isSelected || undefined}
        data-pressed={isPressed || undefined}
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={isDisabled || undefined}
        data-readonly={isReadOnly || undefined}
        data-invalid={isInvalid || undefined}>
        <VisuallyHidden elementType="span">
          <input {...mergeProps(inputProps, focusProps)} ref={ref} />
        </VisuallyHidden>
        <div className="track indicator">
          <div
            data-disabled={isDisabled || undefined}
            className={isSelected ? 'handle' : 'handle indicator'}
          />
        </div>
        {props.children}
      </label>
    </div>
  );
}
