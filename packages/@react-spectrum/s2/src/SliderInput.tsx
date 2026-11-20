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
import {useNumberFormatter} from 'react-aria/useNumberFormatter';

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

// Hidden pseudo-elements in the same grid cell reserve the widest formatted min/max value so
// the field doesn't resize as the slider moves.
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

// Sizes each range input to its current text so the range separator stays flush against it.
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

// Inputs don't inherit font-variant-numeric from their parent by default, and the style macro
// doesn't support this property, so apply it inline.
const inputStyle = {fontVariantNumeric: 'tabular-nums'};

function RangeAutoWidthInput(): ReactNode {
  let state = useContext(NumberFieldStateContext);
  return (
    <div className={autoWidthInputSizer} data-value={state?.inputValue || '0'}>
      <Input
        UNSAFE_style={inputStyle}
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

function focusClosestRangeInput(container: HTMLElement, clientX: number) {
  let inputs = Array.from(container.querySelectorAll('input'));
  if (inputs.length === 2) {
    let [start, end] = inputs;
    let startRect = start.getBoundingClientRect();
    let endRect = end.getBoundingClientRect();
    // Compare rendered rects to handle RTL layouts where the start input is on the right.
    let startIsRight = startRect.left > endRect.left;
    let [left, right] = startIsRight ? [endRect, startRect] : [startRect, endRect];
    let clickedRight = clientX >= (left.right + right.left) / 2;
    let target = clickedRight === startIsRight ? start : end;
    if (target.disabled) {
      target = target === start ? end : start;
    }
    target.focus();
  }
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
  let numberFormatter = useNumberFormatter();
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
        data-slider-input
        slot="0"
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
              UNSAFE_style={inputStyle}
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

  // Use the locale's range separator (e.g. "–", "-", "～"). The min input is rendered first, so in
  // RTL locales the flex layout places it on the right, matching how the bidi algorithm displays
  // a formatted number range like "10–20" in RTL text.
  let separator =
    numberFormatter
      .formatRangeToParts(0, 1)
      .filter(part => part.source === 'shared')
      .map(part => part.value)
      .join('')
      .trim() || '–';
  let rangeMinSizer = `${minSizer}\u00a0${separator}\u00a0${minSizer}`;
  let rangeMaxSizer = `${maxSizer}\u00a0${separator}\u00a0${maxSizer}`;

  return (
    <div
      {...domProps}
      data-slider-input="range"
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapperStyles(null, styles)}>
      <FieldGroup
        role="presentation"
        isDisabled={state.isDisabled}
        size={size}
        styles={editableFieldGroup({size, isRange: true})}
        // FieldGroup focuses its first input when the group itself is pressed. For a range, focus
        // whichever input is closest to the press instead (e.g. clicking the separator or padding
        // near the max value focuses the max input), and preventDefault so FieldGroup's handler
        // skips its default. Presses directly on an input are left alone.
        onPointerDownCapture={e => {
          if (
            !state.isDisabled &&
            e.pointerType === 'mouse' &&
            e.button === 0 &&
            !(getEventTarget(e) as Element).closest('input')
          ) {
            e.preventDefault();
            focusClosestRangeInput(e.currentTarget, e.clientX);
          }
        }}
        onTouchEndCapture={e => {
          let touch = e.changedTouches[0];
          if (!state.isDisabled && touch && !(getEventTarget(e) as Element).closest('input')) {
            e.preventDefault();
            focusClosestRangeInput(e.currentTarget, touch.clientX);
          }
        }}>
        <div className={editableInputSizer} data-min={rangeMinSizer} data-max={rangeMaxSizer}>
          <div
            className={style({
              gridColumnStart: 1,
              gridRowStart: 1,
              width: 0,
              minWidth: 'full',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center'
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
              {separator}
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
