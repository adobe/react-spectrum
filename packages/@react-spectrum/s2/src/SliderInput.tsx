/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  NumberField as AriaNumberField,
  NumberFieldStateContext
} from 'react-aria-components/NumberField';
import {css} from '../style/style-macro' with {type: 'macro'};
import {DOMProps, DOMRef} from '@react-types/shared';
import {FieldGroup, Input} from './Field';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRef, ReactNode, useContext} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import intlMessages from '../intl/*.json';
import {SliderInternalContext} from './Slider';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export interface SliderInputProps extends DOMProps, StyleProps {}

const wrapperStyles = style({flexShrink: 0}, getAllowedOverrides());

const editableFieldGroup = style({
  contain: {
    default: 'none',
    '@supports (contain-intrinsic-width: 1px)': 'none'
  },
  width: 'auto',
  minWidth: {
    default: 48,
    size: {
      S: 36,
      L: 60,
      XL: 72
    },
    isRange: {
      default: 80,
      size: {
        S: 64,
        L: 96,
        XL: 112
      }
    }
  }
});

const editableInputSizer = css(`
  display: inline-grid;
  flex-grow: 1;
  font-variant-numeric: tabular-nums;
  &::before, &::after {
    grid-area: 1 / 1;
    visibility: hidden;
    pointer-events: none;
    white-space: pre;
    height: 0;
    overflow: hidden;
    padding-inline-end: 6px;
  }
  &::before {
    content: attr(data-min);
  }
  &::after {
    content: attr(data-max);
  }
`);

const autoWidthInputSizer = css(`
  display: inline-grid;
  min-width: 0;
  &::after {
    content: attr(data-value);
    grid-area: 1 / 1;
    visibility: hidden;
    pointer-events: none;
    white-space: pre;
    height: 0;
    overflow: hidden;
    padding-inline-end: 2px;
  }
`);

function RangeAutoWidthInput(): ReactNode {
  let state = useContext(NumberFieldStateContext);
  return (
    <div className={autoWidthInputSizer} data-value={state?.inputValue || '0'}>
      <Input
        styles={style({
          gridColumnStart: 1,
          gridRowStart: 1,
          width: 0,
          minWidth: 'full'
        })}
      />
    </div>
  );
}

/**
 * SliderInput renders an editable text field for a Slider or RangeSlider, allowing users
 * to precisely input numeric values alongside dragging the slider thumbs.
 */
export const SliderInput = /*#__PURE__*/ forwardRef(function SliderInput(
  props: SliderInputProps,
  ref: DOMRef<HTMLDivElement>
) {
  let ctx = useContext(SliderInternalContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let domRef = useDOMRef(ref);
  let {UNSAFE_className = '', UNSAFE_style, styles} = props;
  let domProps = filterDOMProps(props);

  if (!ctx) {
    return null;
  }

  let {size, state, minSizer, maxSizer} = ctx;
  if (state.values.length === 1) {
    return (
      <AriaNumberField
        {...domProps}
        ref={domRef}
        style={UNSAFE_style}
        className={UNSAFE_className + wrapperStyles(null, styles)}>
        <FieldGroup
          role="presentation"
          isDisabled={state.isDisabled}
          size={size}
          styles={editableFieldGroup({size, isRange: false})}>
          <div className={editableInputSizer} data-min={minSizer} data-max={maxSizer}>
            <Input
              styles={style({
                gridColumnStart: 1,
                gridRowStart: 1,
                width: 0,
                minWidth: 'full'
              })}
            />
          </div>
        </FieldGroup>
      </AriaNumberField>
    );
  }

  let rangeMinSizer = `${minSizer}\u00a0–\u00a0${minSizer}`;
  let rangeMaxSizer = `${maxSizer}\u00a0–\u00a0${maxSizer}`;

  return (
    <div
      {...domProps}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapperStyles(null, styles)}>
      <FieldGroup
        role="presentation"
        isDisabled={state.isDisabled}
        size={size}
        styles={editableFieldGroup({size, isRange: true})}>
        <div className={editableInputSizer} data-min={rangeMinSizer} data-max={rangeMaxSizer}>
          <div
            onPointerDown={e => {
              if (e.pointerType === 'mouse' && !(getEventTarget(e) as Element).closest('input')) {
                e.preventDefault();
                e.stopPropagation();
                let inputs = Array.from(e.currentTarget.querySelectorAll('input'));
                if (inputs.length === 2) {
                  let sepRect = e.currentTarget.querySelector('span')?.getBoundingClientRect();
                  let target =
                    sepRect && e.clientX >= sepRect.left + sepRect.width / 2
                      ? inputs[1]
                      : inputs[0];
                  target.focus();
                }
              }
            }}
            className={style({
              gridColumnStart: 1,
              gridRowStart: 1,
              width: 0,
              minWidth: 'full',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            })}>
            <AriaNumberField
              slot="0"
              aria-label={stringFormatter.format('slider.minimum')}
              className={style({display: 'inline-flex', minWidth: 0})}>
              <RangeAutoWidthInput />
            </AriaNumberField>
            <span
              aria-hidden="true"
              className={style({paddingX: 2, flexShrink: 0, userSelect: 'none'})}>
              –
            </span>
            <AriaNumberField
              slot="1"
              aria-label={stringFormatter.format('slider.maximum')}
              className={style({display: 'inline-flex', minWidth: 0})}>
              <RangeAutoWidthInput />
            </AriaNumberField>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
});
