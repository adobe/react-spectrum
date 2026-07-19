'use client';
import {createCalendar} from '@internationalized/date';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useDateField,
  useDateSegment,
  type AriaDateFieldProps,
  type DateValue
} from 'react-aria/useDateField';
import {
  useDateFieldState,
  type DateFieldState,
  type DateSegment as DateSegmentType
} from 'react-stately/useDateFieldState';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useLocale} from 'react-aria/I18nProvider';
import {useRef, useState} from 'react';
import './DateField.css';
import './Form.css';

export function DateField(props: AriaDateFieldProps<DateValue> & {label?: React.ReactNode}) {
  let {locale} = useLocale();
  let state = useDateFieldState({...props, locale, createCalendar});
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {labelProps, fieldProps} = useDateField(props, state, ref);
  /*- end highlight -*/
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({onFocusWithinChange: setFocusWithin});

  return (
    <div className="react-aria-DateField">
      <label className="react-aria-Label" {...labelProps}>
        {props.label}
      </label>
      <div
        {...mergeProps(fieldProps, focusWithinProps)}
        ref={ref}
        className="react-aria-DateInput inset"
        data-focus-within={isFocusWithin || undefined}>
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
}

export function DateSegment({segment, state}: {segment: DateSegmentType; state: DateFieldState}) {
  let ref = useRef<HTMLSpanElement>(null);
  let {segmentProps} = useDateSegment(segment, state, ref);

  return (
    <span
      {...segmentProps}
      ref={ref}
      className="react-aria-DateSegment"
      data-type={segment.type}
      data-placeholder={segment.isPlaceholder || undefined}>
      {segment.text}
    </span>
  );
}
