import {AriaDateFieldProps, AriaTimeFieldProps, useDateField, useDateSegment, useLocale, useTimeField} from 'react-aria';
import {createCalendar} from '@internationalized/date';
import {DateFieldState, DateSegment as IDateSegment, useDateFieldState, useTimeFieldState} from 'react-stately';
import {DateValue, TimeValue} from '@react-types/datepicker';
import {LabelContext} from './Label';
import {Provider, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactElement, ReactNode, RefObject, useContext, useRef} from 'react';
import {useObjectRef} from '@react-aria/utils';

interface DateFieldProps<T extends DateValue> extends AriaDateFieldProps<T> {
  children: ReactNode
}

interface TimeFieldProps<T extends TimeValue> extends AriaTimeFieldProps<T> {
  children: ReactNode
}

interface DateInputContextValue {
  state: DateFieldState,
  fieldProps: HTMLAttributes<HTMLElement>,
  ref: RefObject<HTMLDivElement>
}

export const DateInputContext = createContext<DateInputContextValue>(null);

export function DateField<T extends DateValue>(props: DateFieldProps<T>) {
  let {locale} = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef();
  let {labelProps, fieldProps} = useDateField({...props, label: 's'}, state, fieldRef);

  return (
    <Provider
      values={[
      [DateInputContext, {state, fieldProps, ref: fieldRef}],
      [LabelContext, labelProps]
      ]}>
      {props.children}
    </Provider>
  );
}

export function TimeField<T extends TimeValue>(props: TimeFieldProps<T>) {
  let {locale} = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale
  });

  let fieldRef = useRef();
  let {labelProps, fieldProps} = useTimeField({...props, label: 's'}, state, fieldRef);

  return (
    <Provider
      values={[
      [DateInputContext, {state, fieldProps, ref: fieldRef}],
      [LabelContext, labelProps]
      ]}>
      {props.children}
    </Provider>
  );
}

const InternalDateInputContext = createContext<DateFieldState>(null);

interface DateInputProps extends SlotProps, StyleProps {
  children: (segment: IDateSegment) => ReactElement
}

function DateInput({children, style, className, slot}: DateInputProps, ref: ForwardedRef<HTMLDivElement>) {
  let [{state, fieldProps}, fieldRef] = useContextProps({slot} as any, ref, DateInputContext);
  return (
    <InternalDateInputContext.Provider value={state}>
      <div {...fieldProps} ref={fieldRef} style={style} className={className}>
        {state.segments.map((segment, i) => cloneElement(children(segment), {key: i}))}
      </div>
    </InternalDateInputContext.Provider>
  );
}

const _DateInput = forwardRef(DateInput);
export {_DateInput as DateInput};

interface DateSegmentRenderProps {
  segment: IDateSegment
}

interface DateSegmentProps extends RenderProps<DateSegmentRenderProps> {
  segment: IDateSegment
}

function DateSegment({segment, className, style, children}: DateSegmentProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(InternalDateInputContext);
  let domRef = useObjectRef(ref);
  let {segmentProps} = useDateSegment(segment, state, domRef);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    values: {segment},
    defaultChildren: segment.text
  });

  return (
    <div
      {...segmentProps}
      {...renderProps}
      ref={domRef} />
  );
}

const _DateSegment = forwardRef(DateSegment);
export {_DateSegment as DateSegment};
