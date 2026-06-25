/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaToggleButtonProps, useToggleButton} from 'react-aria/useToggleButton';

import {ButtonRenderProps} from './Button';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {HoverEvents} from '@react-types/shared';
import {mergeProps} from 'react-aria/mergeProps';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {ToggleGroupStateContext} from './ToggleButtonGroup';
import {ToggleState, useToggleState} from 'react-stately/useToggleState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useToggleButtonGroupItem} from 'react-aria/useToggleButtonGroup';

export interface ToggleButtonRenderProps extends Omit<ButtonRenderProps, 'isPending'> {
  /**
   * Whether the button is currently selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * State of the toggle button.
   */
  state: ToggleState;
}

export interface ToggleButtonProps
  extends
    Omit<AriaToggleButtonProps, 'children' | 'elementType' | 'id'>,
    HoverEvents,
    SlotProps,
    RenderProps<ToggleButtonRenderProps, 'button'>,
    Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ToggleButton'
   */
  className?: ClassNameOrFunction<ToggleButtonRenderProps>;
  /**
   * When used in a ToggleButtonGroup, an identifier for the item in `selectedKeys`. When used
   * standalone, a DOM id.
   */
  id?: Key;
}

export const ToggleButtonContext = createContext<
  ContextValue<ToggleButtonProps, HTMLButtonElement>
>({});

function ToggleButtonStandalone({
  props,
  ref
}: {
  props: ToggleButtonProps;
  ref: ForwardedRef<HTMLButtonElement>;
}) {
  let state = useToggleState(props);
  let buttonRef = useObjectRef(ref);
  let {buttonProps, isPressed, isSelected, isDisabled} = useToggleButton(
    {...props, id: props.id != null ? String(props.id) : undefined} as Parameters<
      typeof useToggleButton
    >[0],
    state,
    buttonRef
  );

  return (
    <ToggleButtonElement
      props={props}
      ref={ref}
      buttonProps={buttonProps}
      isPressed={isPressed}
      isSelected={isSelected}
      isDisabled={isDisabled}
      state={state}
    />
  );
}

function ToggleButtonInGroup({
  props,
  ref,
  groupState
}: {
  props: ToggleButtonProps;
  ref: ForwardedRef<HTMLButtonElement>;
  groupState: NonNullable<React.ContextType<typeof ToggleGroupStateContext>>;
}) {
  let state = useToggleState({
    isSelected: groupState.selectedKeys.has(props.id!),
    onChange(isSelected) {
      groupState.setSelected(props.id!, isSelected);
    }
  });
  let buttonRef = useObjectRef(ref);
  let {buttonProps, isPressed, isSelected, isDisabled} = useToggleButtonGroupItem(
    {...props, id: props.id!} as Parameters<typeof useToggleButtonGroupItem>[0],
    groupState,
    buttonRef
  );

  return (
    <ToggleButtonElement
      props={props}
      ref={ref}
      buttonProps={buttonProps}
      isPressed={isPressed}
      isSelected={isSelected}
      isDisabled={isDisabled}
      state={state}
    />
  );
}

function ToggleButtonElement({
  props,
  ref,
  buttonProps,
  isPressed,
  isSelected,
  isDisabled,
  state
}: {
  props: ToggleButtonProps;
  ref: ForwardedRef<HTMLButtonElement>;
  buttonProps: ReturnType<typeof useToggleButton>['buttonProps'];
  isPressed: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  state: ToggleState;
}) {
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover({...props, isDisabled});
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    values: {
      isHovered,
      isPressed,
      isFocused,
      isSelected: state.isSelected,
      isFocusVisible,
      isDisabled,
      state
    },
    defaultClassName: 'react-aria-ToggleButton'
  });

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <dom.button
      {...mergeProps(DOMProps, renderProps, buttonProps, focusProps, hoverProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-focused={isFocused || undefined}
      data-disabled={isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-selected={isSelected || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <SelectionIndicatorContext.Provider value={{isSelected}}>
        {renderProps.children}
      </SelectionIndicatorContext.Provider>
    </dom.button>
  );
}

/**
 * A toggle button allows a user to toggle a selection on or off, for example switching between two
 * states or modes.
 */
export const ToggleButton = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToggleButton(
  propsArg: ToggleButtonProps,
  refArg: ForwardedRef<HTMLButtonElement>
) {
  let props = propsArg;
  let ref = refArg;
  [props, ref] = useContextProps(props, ref, ToggleButtonContext);
  let groupState = useContext(ToggleGroupStateContext);

  if (groupState && props.id != null) {
    return <ToggleButtonInGroup props={props} ref={ref} groupState={groupState} />;
  }

  return <ToggleButtonStandalone props={props} ref={ref} />;
});
