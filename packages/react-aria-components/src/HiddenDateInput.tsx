/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


import {CalendarDate, CalendarDateTime, parseDate, parseDateTime} from '@internationalized/date';
import {DateFieldState, DatePickerState} from 'react-stately';
import React, {useEffect} from 'react';
import {useVisuallyHidden} from 'react-aria';

interface AriaHiddenDateInputProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,
  /** HTML form input name. */
  name?: string,
  /** Sets the disabled state of the input. */
  isDisabled?: boolean
}

interface HiddenDateInputProps extends AriaHiddenDateInputProps {
  /**
   * State for the input.
   */
  state: DateFieldState | DatePickerState
}

export interface HiddenDateAria {
  /** Props for the container element. */
  containerProps: React.HTMLAttributes<HTMLDivElement>,
  /** Props for the hidden input element. */
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
}

export function useHiddenDateInput(props: HiddenDateInputProps, state) {
  let {
    autoComplete,
    isDisabled,
    name
  } = props;
  let [dateValue, setDateValue] = React.useState('');
  let {visuallyHiddenProps} = useVisuallyHidden();

  let inputStep = 60;
  if (state.granularity === 'second') {
    inputStep = 1;
  } else if (state.granularity === 'hour') {
    inputStep = 3600; 
  }

  useEffect(() => {
    if (state.value == null) {
      setDateValue('');
    } else {
      setDateValue(state.value);
    }
  }, [state.value]);
  
  let inputType = state.granularity === 'day' ? 'date' : 'datetime-local';

  let dateSegments = ['day', 'month', 'year'];
  let timeSegments = ['hour', 'minute', 'second'];
  let granularitySegments = {'hour': 1, 'minute': 2, 'second': 3};


  let end = 0;
  if (timeSegments.includes(state.granularity)) {
    end = granularitySegments[state.granularity];
    timeSegments = timeSegments.slice(0, end);
  }

  return {
    containerProps: {
      ...visuallyHiddenProps,
      'aria-hidden': true,
      // @ts-ignore
      ['data-react-aria-prevent-focus']: true,
      // @ts-ignore
      ['data-a11y-ignore']: 'aria-hidden-focus'
    },
    inputProps: {
      tabIndex: -1,
      autoComplete,
      disabled: isDisabled,
      type: inputType,
      form: '',
      name,
      step: inputStep,
      value: dateValue,
      onChange: (e) => {
        let targetString = e.target.value.toString();
        if (targetString) {
          let targetValue: CalendarDateTime | CalendarDate = parseDateTime(targetString);
          if (state.granularity === 'day') {
            targetValue = parseDate(targetString);
          }
          setDateValue(targetString);
          // DatePickerState doesn't have a setSegment method so this is only necessary to do in DateFields
          if (typeof state.setSegment === 'function') {
            console.log(targetValue);
            for (let type in targetValue) {
              if (dateSegments.includes(type)) {
                state.setSegment(type, targetValue[type]);
              }
              if (timeSegments.includes(type)) {
                state.setSegment(type, targetValue[type]);
              }
            }
            
          }
          state.setValue(targetValue);
        }
      }
    }
  };
}

export function HiddenDateInput(props) {
  let {state} = props;
  let {containerProps, inputProps} = useHiddenDateInput({...props}, state);
  return (
    <div {...containerProps}>
      <input {...inputProps} />
    </div>
  );
}
