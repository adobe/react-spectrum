'use client';
import {useDateSegment} from 'react-aria/useDateField';
import {mergeProps} from 'react-aria/mergeProps';
import {useTimeField, type AriaTimeFieldProps, type TimeValue} from 'react-aria/useTimeField';
import {type DateSegment as DateSegmentType} from 'react-stately/useDateFieldState';
import {useTimeFieldState, type TimeFieldState} from 'react-stately/useTimeFieldState';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useLocale} from 'react-aria/I18nProvider';
import {useRef, useState} from 'react';
import './DateField.css';
import './TimeField.css';
import './Form.css';

export interface TimeFieldProps extends AriaTimeFieldProps<TimeValue> {
  label?: React.ReactNode;
}

export function TimeField(props: TimeFieldProps) {
  let {locale} = useLocale();
  let state = useTimeFieldState({...props, locale});
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {labelProps, fieldProps} = useTimeField(props, state, ref);
  /*- end highlight -*/
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({onFocusWithinChange: setFocusWithin});

  return (
    <div className="react-aria-TimeField">
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

function DateSegment({segment, state}: {segment: DateSegmentType; state: TimeFieldState}) {
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
