/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CheckboxGroupContext} from './context';
import CheckmarkSmall from '@spectrum-icons/ui/CheckmarkSmall';
import {classNames, useFocusableRef, usePressScale, pressScale, useStyleProps} from '@react-spectrum/utils';
import DashSmall from '@spectrum-icons/ui/DashSmall';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useContext, useRef} from 'react';
import {SpectrumCheckboxProps} from '@react-types/checkbox';
import styles from '@adobe/spectrum-css-temp/components/checkbox/vars.css';
import {useCheckbox, useCheckboxGroupItem} from '@react-aria/checkbox';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useToggleState} from '@react-stately/toggle';
import {Checkbox as RACCheckbox} from 'react-aria-components';
import {tv} from 'tailwind-variants';

const checkboxStyles = tv({
  slots: {
    base: 'group flex items-baseline transition text-base-neutral disabled:text-disabled',
    box: 'relative center-baseline justify-center w-[--size] shrink-0 transition',
    fill: 'absolute w-[--size] h-[--size] box-border transition-all bg-gray-75 border-200 border-solid rounded-75 group-selected:border-[calc(var(--size)/2)] group-selected:group-border-base-tint group-disabled:border-disabled-content group-focus-visible:ring',
    checkmark: 'shrink-0 text-white opacity-0 scale-0 transition group-selected:opacity-100 group-selected:scale-100'
  },
  variants: {
    size: {
      S: {
        base: 'gap-ttc-75 text-75',
        box: 'min-h-c-75 [--size:theme(spacing.150)]'
        // TODO: missing checkmark size tokens.
      },
      M: {
        base: 'gap-ttc-100 text-100',
        box: 'min-h-c-100 [--size:theme(spacing.175)]'
      },
      L: {
        base: 'gap-ttc-200 text-200',
        box: 'min-h-c-200 [--size:theme(spacing.200)]'
      },
      XL: {
        base: 'gap-ttc-300 text-300',
        box: 'min-h-c-300 [--size:theme(spacing.225)]'
      }
    },
    variant: {
      default: {
        base: 'tint-neutral',
        fill: 'group-border-base-gray-800'
      },
      emphasized: {
        base: 'tint-accent/900',
        fill: 'group-border-base-gray-800'
      },
      invalid: {
        base: 'tint-negative/900',
        fill: 'group-border-base-negative-900'
      }
    }
  }
}, {twMerge: false});

function Checkbox(props: SpectrumCheckboxProps, ref: FocusableRef<HTMLLabelElement>) {
  let originalProps = props;
  props = useProviderProps(props);
  let {
    isIndeterminate = false,
    isEmphasized = false,
    isDisabled = false,
    autoFocus,
    children,
    validationState,
    isInvalid,
    size = 'M',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  // let {hoverProps, isHovered} = useHover({isDisabled});

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);

  // Swap hooks depending on whether this checkbox is inside a CheckboxGroup.
  // This is a bit unorthodox. Typically, hooks cannot be called in a conditional,
  // but since the checkbox won't move in and out of a group, it should be safe.
  let groupState = useContext(CheckboxGroupContext);
  // let {inputProps, isPressed} = groupState
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   ? useCheckboxGroupItem({
  //     ...props,
  //     // Value is optional for standalone checkboxes, but required for CheckboxGroup items;
  //     // it's passed explicitly here to avoid typescript error (requires ignore).
  //     // @ts-ignore
  //     value: props.value,
  //     // Only pass isRequired and validationState to react-aria if they came from
  //     // the props for this individual checkbox, and not from the group via context.
  //     isRequired: originalProps.isRequired,
  //     validationState: originalProps.validationState,
  //     isInvalid: originalProps.isInvalid
  //   }, groupState, inputRef)
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   : useCheckbox(props, useToggleState(props), inputRef);

  // let markIcon = isIndeterminate
  //   ? <DashSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-partialCheckmark')} />
  //   : <CheckmarkSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-checkmark')} />;
  let variant: 'default' | 'invalid' | 'emphasized' = 'default';
  if (isInvalid) {
    variant = 'invalid';
  } else if (isEmphasized) {
    variant = 'emphasized';
  }
  let {base, box, fill, checkmark} = checkboxStyles({variant, size});
  let markIcon = isIndeterminate
    ? <DashSmall UNSAFE_className={checkmark()} />
    : <CheckmarkSmall UNSAFE_className={checkmark()} />;

  if (groupState) {
    for (let key of ['isSelected', 'defaultSelected', 'isEmphasized']) {
      if (originalProps[key] != null) {
        console.warn(`${key} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. Please apply these props to the group instead.`);
      }
    }
    if (props.value == null) {
      console.warn('A <Checkbox> element within a <CheckboxGroup> requires a `value` property.');
    }
  }

  let boxRef = useRef(null);
  // usePressScale(boxRef, isPressed);

  return (
    <RACCheckbox {...props} isSelected={isIndeterminate || props.isSelected} {...styleProps} ref={domRef} className={base()}>
      {renderProps => (<>
        <div className={box()} style={pressScale(boxRef, {})(renderProps)}>
          <span className={fill()} ref={boxRef} />
          {markIcon}
        </div>
        {children}
      </>)}
    </RACCheckbox>
  )

  // return (
  //   <label
  //     {...styleProps}
  //     {...hoverProps}
  //     ref={domRef}
  //     className={
  //       classNames(
  //         styles,
  //         'spectrum-Checkbox',
  //         {
  //           'is-checked': inputProps.checked,
  //           'is-indeterminate': isIndeterminate,
  //           'spectrum-Checkbox--quiet': !isEmphasized,
  //           'is-invalid': isInvalid || validationState === 'invalid',
  //           'is-disabled': isDisabled,
  //           'is-hovered': isHovered
  //         },
  //         styleProps.className
  //       )
  //     }>
  //     <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
  //       <input
  //         {...inputProps}
  //         ref={inputRef}
  //         className={classNames(styles, 'spectrum-Checkbox-input')} />
  //     </FocusRing>
  //     <span className={classNames(styles, 'spectrum-Checkbox-box')} ref={boxRef}>{markIcon}</span>
  //     {children && (
  //       <span className={classNames(styles, 'spectrum-Checkbox-label')}>
  //         {children}
  //       </span>
  //     )}
  //   </label>
  // );
}
/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
let _Checkbox = forwardRef(Checkbox);
export {_Checkbox as Checkbox};
