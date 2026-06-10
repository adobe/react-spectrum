'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useToggleButtonGroup,
  useToggleButtonGroupItem,
  type AriaToggleButtonGroupProps,
  type AriaToggleButtonGroupItemProps
} from 'react-aria/useToggleButtonGroup';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useToggleGroupState, type ToggleGroupState} from 'react-stately/useToggleGroupState';
import {createContext, useContext, useRef} from 'react';
import type {ReactNode} from 'react';
import './ToggleButtonGroup.css';
import './ToggleButton.css';

const ToggleButtonGroupContext = createContext<ToggleGroupState | null>(null);

export function ToggleButtonGroup(props: AriaToggleButtonGroupProps & {children?: ReactNode}) {
  let {orientation = 'horizontal'} = props;
  // useToggleGroupState manages single or multiple selection across the items.
  let state = useToggleGroupState(props);
  let ref = useRef<HTMLDivElement>(null);
  let {groupProps} = useToggleButtonGroup(props, state, ref);

  return (
    <div
      {...groupProps}
      ref={ref}
      className="react-aria-ToggleButtonGroup"
      data-orientation={orientation}>
      {/* The group state is shared with the items via React context. */}
      <ToggleButtonGroupContext.Provider value={state}>
        {props.children}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
}

export function ToggleButton(props: AriaToggleButtonGroupItemProps) {
  let ref = useRef<HTMLButtonElement>(null);
  let state = useContext(ToggleButtonGroupContext)!;
  let {buttonProps, isSelected, isPressed, isDisabled} = useToggleButtonGroupItem(
    props,
    state,
    ref
  );
  let {hoverProps, isHovered} = useHover(props);
  // Show a focus ring only when interacting with the keyboard.
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      className="react-aria-ToggleButton button-base"
      data-variant="primary"
      data-selected={isSelected || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}>
      <span>{props.children}</span>
    </button>
  );
}
