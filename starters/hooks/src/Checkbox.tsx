'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useCheckbox, type AriaCheckboxProps} from 'react-aria/useCheckbox';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useToggleState} from 'react-stately/useToggleState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';
import {useRef} from 'react';
import './Checkbox.css';

export function Checkbox(props: AriaCheckboxProps) {
  let state = useToggleState(props);
  let ref = useRef<HTMLInputElement>(null);
  /*- begin highlight -*/
  let {inputProps, isSelected, isPressed, isDisabled, isReadOnly, isInvalid} = useCheckbox(
    props,
    state,
    ref
  );
  /*- end highlight -*/
  let {hoverProps, isHovered} = useHover({isDisabled: isDisabled || isReadOnly});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isIndeterminate = props.isIndeterminate || false;

  return (
    <div className="react-aria-CheckboxField" data-disabled={isDisabled || undefined}>
      {/* The label wraps a visually hidden native input plus the styled indicator. */}
      <label
        {...hoverProps}
        className="react-aria-CheckboxButton"
        data-selected={isSelected || undefined}
        data-indeterminate={isIndeterminate || undefined}
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
        <div className="indicator">
          <svg
            viewBox="0 0 18 18"
            aria-hidden="true"
            key={isIndeterminate ? 'indeterminate' : 'check'}>
            {isIndeterminate ? (
              <rect x={1} y={7.5} width={16} height={3} />
            ) : (
              <polyline points="2 9 7 14 16 4" />
            )}
          </svg>
        </div>
        {props.children}
      </label>
    </div>
  );
}
