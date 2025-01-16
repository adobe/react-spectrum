/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorPicker as AriaColorPicker, Button, Color} from 'react-aria-components';
import {AriaLabelingProps, FocusableRef, ValueBase} from '@react-types/shared';
import {ColorSwatch} from './ColorSwatch';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import React, {ReactNode, useRef} from 'react';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {unwrapDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {useId} from '@react-aria/utils';

export interface SpectrumColorPickerProps extends ValueBase<string | Color, Color>, AriaLabelingProps {
  /** A visual label for the color picker. */
  label?: ReactNode,
  /** The contents of the color picker popover, e.g. `<ColorEditor />`. */
  children?: ReactNode,
  /**
   * The size of the color swatch.
   * @default "M"
   */
  size?: 'XS' | 'S' | 'M' | 'L',
  /**
   * The corner rounding of the color swatch.
   * @default "default"
   */
  rounding?: 'default' | 'none' | 'full'
}

/**
 * A ColorPicker combines a swatch with a customizable popover for editing a color.
 */
export const ColorPicker = React.forwardRef(function ColorPicker(props: SpectrumColorPickerProps, ref: FocusableRef<HTMLButtonElement>) {
  let swatchRef = useRef(null);
  let domRef = useFocusableRef(ref);
  let labelId = useId();
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger type="popover" mobileType="tray" targetRef={unwrapDOMRef(swatchRef)}>
        <Button 
          ref={domRef}
          className={style({
            backgroundColor: 'transparent',
            borderStyle: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'text-to-control',
            outlineStyle: 'none',
            fontFamily: 'sans',
            color: 'body',
            fontSize: {
              size: {
                XS: 'xs',
                S: 'sm',
                M: 'base',
                L: 'lg'
              }
            }
          })({size: props.size || 'M'})}>
          {({isFocusVisible}) => (
            <>
              <div
                className={style({
                  outlineStyle: {
                    default: 'none',
                    isFocusVisible: 'solid'
                  },
                  outlineColor: 'focus-ring',
                  outlineWidth: 2,
                  outlineOffset: 2,
                  borderRadius: 'default'
                })({isFocusVisible})}>
                <ColorSwatch
                  ref={swatchRef}
                  color={props.value}
                  size={props.size}
                  rounding={props.rounding}
                  aria-label={props['aria-label']}
                  aria-labelledby={props['aria-labelledby']}
                  aria-describedby={props['aria-describedby']}
                  aria-details={props['aria-details']} />
              </div>
              {props.label && 
                <span id={labelId}>{props.label}</span>
              }
            </>
          )}
        </Button>
        <Dialog 
          aria-labelledby={props.label ? labelId : props['aria-labelledby']}
          aria-label={props['aria-label']}
          UNSAFE_style={{
            width: 'fit-content',
            minWidth: 0,
            margin: '0 auto' // Center within tray.
          }}>
          <Content 
            UNSAFE_style={{
              position: 'relative',
              margin: 'calc(var(--spectrum-dialog-padding) * -1)',
              padding: 'var(--spectrum-global-dimension-size-200)'
            }}>
            {props.children}
          </Content>
        </Dialog>
      </DialogTrigger>
    </AriaColorPicker>
  );
});
