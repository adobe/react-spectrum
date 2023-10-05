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

import {classNames, pressScale, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React, {forwardRef, useRef} from 'react';
import {SpectrumSwitchProps} from '@react-types/switch';
import styles from '@adobe/spectrum-css-temp/components/toggle/vars.css';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import {useSwitch} from '@react-aria/switch';
import {useToggleState} from '@react-stately/toggle';
import {tv} from 'tailwind-variants';
import {Switch as RACSwitch} from 'react-aria-components';

let switchStyles = tv({
  slots: {
    base: 'group flex items-baseline transition text-base-neutral disabled:text-disabled',
    track: 'center-baseline w-[--w] shrink-0 rounded-full transition bg-gray-300 group-selected:group-bg-base-tint group-disabled:group-selected:bg-disabled-content group-focus-visible:ring',
    handle: 'h-full aspect-square rounded-full bg-gray-75 border-200 border-solid box-border group-border-base-gray-800 group-selected:group-border-base-tint group-disabled:border-disabled-content transition translate-x-0 dir group-selected:translate-x-[calc(var(--dir)*(var(--w)-100%))]'
  },
  variants: {
    size: {
      S: {
        base: 'gap-ttc-75 text-75',
        track: 'h-75 [--w:23px]'
      },
      M: {
        base: 'gap-ttc-100 text-100',
        track: 'h-[14px] [--w:26px]'
      },
      L: {
        base: 'gap-ttc-200 text-200',
        track: 'h-200 [--w:29px]'
      },
      XL: {
        base: 'gap-ttc-300 text-300',
        track: 'h-300 [--w:33px]'
      }
    },
    isEmphasized: {
      true: {
        base: 'tint-accent/900'
      },
      false: {
        base: 'tint-neutral'
      }
    }
  }
}, {
  twMerge: false
});

function Switch(props: SpectrumSwitchProps, ref: FocusableRef<HTMLLabelElement>) {
  props = useProviderProps(props);
  let {
    isEmphasized = false,
    isDisabled = false,
    autoFocus,
    children,
    size = 'M',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  // let {hoverProps, isHovered} = useHover({isDisabled});

  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  // let state = useToggleState(props);
  // let {inputProps, isPressed} = useSwitch(props, state, inputRef);

  let handleRef = useRef();
  // usePressScale(switchRef, isPressed);

  let {base, track, handle} = switchStyles({isEmphasized, size});

  return (
    <RACSwitch {...props} {...styleProps} ref={domRef} className={base()}>
      {renderProps => (<>
        <div className={track()}>
          <span className={handle()} ref={handleRef} style={pressScale(handleRef, {})(renderProps)} />
        </div>
        {children}
      </>)}
    </RACSwitch>
  );

  // return (
  //   <label
  //     {...styleProps}
  //     {...hoverProps}
  //     ref={domRef}
  //     className={
  //       classNames(
  //         styles,
  //         'spectrum-ToggleSwitch',
  //         {
  //           'spectrum-ToggleSwitch--quiet': !isEmphasized,
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
  //         className={classNames(styles, 'spectrum-ToggleSwitch-input')} />
  //     </FocusRing>
  //     <span className={classNames(styles, 'spectrum-ToggleSwitch-switch')} ref={switchRef} />
  //     {children && (
  //       <span className={classNames(styles, 'spectrum-ToggleSwitch-label')}>
  //         {children}
  //       </span>
  //     )}
  //   </label>
  // );
}

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
const _Switch = forwardRef(Switch);
export {_Switch as Switch};
