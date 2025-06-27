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

import {
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerProps as AriaDateRangePickerProps,
  Button,
  ButtonRenderProps,
  ContextValue,
  DateInput,
  DateSegment,
  DateValue,
  FormContext,
  Provider
} from 'react-aria-components';
import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import CalendarIcon from '../s2wf-icons/S2_Icon_Calendar_20_N.svg';
import {controlBorderRadius, field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactElement, Ref, useContext, useRef, useState} from 'react';
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText} from './Field';
import {forwardRefType, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {IconContext, RangeCalendar, TimeField} from '../';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {PopoverBase} from './Popover';
import {pressScale} from './pressScale';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface DateRangePickerProps<T extends DateValue> extends
  Omit<AriaDateRangePickerProps<T>, 'children' | 'className' | 'style'>,
  StyleProps,
  SpectrumLabelableProps,
  HelpTextProps {
    /**
     * The size of the DateField.
     *
     * @default 'M'
     */
    size?: 'S' | 'M' | 'L' | 'XL'
}

export const DateRangePickerContext = createContext<ContextValue<Partial<DateRangePickerProps<any>>, HTMLDivElement>>(null);

const segmentContainer = style({
  flexGrow: 0,
  flexShrink: 1,
  overflow: 'hidden',
  textWrap: 'nowrap',
  display: 'flex',
  flexWrap: 'nowrap'
});
const segment = style({
  flexGrow: 0,
  flexShrink: 0
});

const dateInput = style({
  outlineStyle: 'none',
  caretColor: 'transparent',
  backgroundColor: {
    default: 'transparent',
    isFocused: 'blue-900'
  },
  color: {
    isFocused: 'white'
  },
  borderRadius: '[2px]',
  paddingX: 2
});

const iconStyles = style({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end'
});

const inputButton = style<ButtonRenderProps & {isOpen: boolean, size: 'S' | 'M' | 'L' | 'XL'}>({
  ...focusRing(),
  ...controlBorderRadius('sm'),
  cursor: 'default',
  display: 'flex',
  textAlign: 'center',
  borderStyle: 'none',
  alignItems: 'center',
  justifyContent: 'center',
  size: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32
    }
  },
  marginStart: 'text-to-control',
  aspectRatio: 'square',
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isOpen: 'gray-200',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isHovered: 'Highlight',
      isOpen: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: 'ButtonFace'
  }
});

export const DateRangePicker = /*#__PURE__*/ (forwardRef as forwardRefType)(function DateRangePicker<T extends DateValue>(
  props: DateRangePickerProps<T>, ref: Ref<HTMLDivElement>
): ReactElement {
  [props, ref] = useSpectrumContextProps(props, ref, DateRangePickerContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {
    label,
    contextualHelp,
    description: descriptionMessage,
    errorMessage,
    isRequired,
    size = 'M',
    labelPosition = 'top',
    necessityIndicator,
    labelAlign = 'start',
    UNSAFE_style,
    UNSAFE_className,
    styles,
    placeholderValue,
    ...dateFieldProps
  } = props;
  let formContext = useContext(FormContext);
  let buttonRef = useRef<HTMLButtonElement>(null);
  let [buttonHasFocus, setButtonHasFocus] = useState(false);

  // TODO: fix width? default min width?
  return (
    <AriaDateRangePicker
      ref={ref}
      isRequired={isRequired}
      {...dateFieldProps}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, styles)}>
      {({isDisabled, isInvalid, isOpen, state}) => {
        let placeholder: DateValue | undefined = placeholderValue || undefined;
        let timePlaceholder = placeholder && 'hour' in placeholder ? placeholder : undefined;
        let timeMinValue = props.minValue && 'hour' in props.minValue ? props.minValue : undefined;
        let timeMaxValue = props.maxValue && 'hour' in props.maxValue ? props.maxValue : undefined;
        let timeGranularity = state.granularity === 'hour'
          || state.granularity === 'minute'
          || state.granularity === 'second'
            ? state.granularity : undefined;
        let showTimeField = !!timeGranularity;
        return (
          <>
            <FieldLabel
              isDisabled={isDisabled}
              isRequired={isRequired}
              size={size}
              labelPosition={labelPosition}
              labelAlign={labelAlign}
              necessityIndicator={necessityIndicator}
              contextualHelp={contextualHelp}>
              {label}
            </FieldLabel>
            <FieldGroup
              role="presentation"
              shouldTurnOffFocusRing={buttonHasFocus}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              size={size}
              styles={style({
                ...fieldInput(),
                textWrap: 'nowrap',
                paddingStart: 'edge-to-text',
                paddingEnd: 4
              })({size})}>
              <div className={segmentContainer}>
                <DateInput slot="start" className={segment}>
                  {(segment) => <DateSegment className={dateInput} segment={segment} />}
                </DateInput>
                <span aria-hidden="true" className={style({flexShrink: 0, flexGrow: 0, paddingX: 2})}>–</span>
                <DateInput slot="end" className={segment}>
                  {(segment) => <DateSegment className={dateInput} segment={segment} />}
                </DateInput>
              </div>
              {isInvalid && <div className={iconStyles}><FieldErrorIcon isDisabled={isDisabled} /></div>}
              <div
                className={style({
                  flexShrink: 0,
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'end'
                })}>
                <Button
                  ref={buttonRef}
                  // Prevent press scale from sticking while DateRangePicker is open.
                  // @ts-ignore
                  isPressed={false}
                  onFocusChange={setButtonHasFocus}
                  style={renderProps => pressScale(buttonRef)(renderProps)}
                  className={renderProps => inputButton({
                    ...renderProps,
                    size,
                    isOpen
                  })}>
                  <Provider
                    values={[
                      [IconContext, {
                        styles: style({size: fontRelative(14)})
                      }]
                    ]}>
                    <CalendarIcon />
                  </Provider>
                </Button>
              </div>
            </FieldGroup>
            <PopoverBase
              hideArrow
              styles={style({paddingX: 16, paddingY: 32})}>
              <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
                <RangeCalendar />
                {showTimeField && (
                  <div className={style({display: 'flex', gap: 16})}>
                    <TimeField
                      styles={style({flexShrink: 1, flexGrow: 1, minWidth: 'fit', flexBasis: '0%'})}
                      label={stringFormatter.format('rangeCalendar.startTime')}
                      value={state.timeRange?.start || null}
                      onChange={v => state.setTime('start', v)}
                      placeholderValue={timePlaceholder}
                      granularity={timeGranularity}
                      minValue={timeMinValue}
                      maxValue={timeMaxValue}
                      hourCycle={props.hourCycle}
                      hideTimeZone={props.hideTimeZone} />
                    <TimeField
                      styles={style({flexShrink: 1, flexGrow: 1, minWidth: 'fit', flexBasis: '0%'})}
                      label={stringFormatter.format('rangeCalendar.endTime')}
                      value={state.timeRange?.end || null}
                      onChange={v => state.setTime('end', v)}
                      placeholderValue={timePlaceholder}
                      granularity={timeGranularity}
                      minValue={timeMinValue}
                      maxValue={timeMaxValue}
                      hourCycle={props.hourCycle}
                      hideTimeZone={props.hideTimeZone} />
                  </div>
                )}
              </div>
            </PopoverBase>
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={descriptionMessage}>
              {errorMessage}
            </HelpText>
          </>
        );
      }}
    </AriaDateRangePicker>
  );
});

