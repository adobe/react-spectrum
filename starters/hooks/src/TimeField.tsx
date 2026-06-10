'use client';
import {useDateSegment} from 'react-aria/useDateField';
import {mergeProps} from 'react-aria/mergeProps';
import {useTimeField, type AriaTimeFieldProps, type TimeValue} from 'react-aria/useTimeField';
import {useTimeFieldState} from 'react-stately/useTimeFieldState';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useLocale} from 'react-aria/I18nProvider';
import {useRef, useState} from 'react';
// TimeField shares the DateInput/DateSegment styling defined in DateField.css.
import './DateField.css';
import './TimeField.css';
import './Form.css';

export function TimeField(props: AriaTimeFieldProps<TimeValue> & {label?: React.ReactNode}) {
  // useTimeFieldState parses the value into editable hour/minute/etc. segments.
  let {locale} = useLocale();
  let state = useTimeFieldState({...props, locale});
  let ref = useRef<HTMLDivElement>(null);
  let {labelProps, fieldProps} = useTimeField(props, state, ref);
  // The vanilla field CSS draws its focus ring from [data-focus-within]; useFocusWithin tracks it.
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

function DateSegment({
  segment,
  state
}: {
  segment: ReturnType<typeof useTimeFieldState>['segments'][number];
  state: ReturnType<typeof useTimeFieldState>;
}) {
  // useDateSegment makes the segment focusable and editable; the focus style is native :focus.
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
