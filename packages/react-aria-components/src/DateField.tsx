import {AriaDateFieldProps, AriaTimeFieldProps, useDateField, useDateSegment, useLocale, useTimeField} from 'react-aria';
import {createCalendar} from '@internationalized/date';
import {DateFieldState, DateSegmentType, DateSegment as IDateSegment, useDateFieldState, useTimeFieldState} from 'react-stately';
import {DateValue, TimeValue} from '@react-types/datepicker';
import {LabelContext} from './Label';
import {Provider, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps, useSlot} from './utils';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactElement, RefObject, useContext, useRef} from 'react';
import {useObjectRef} from '@react-aria/utils';

interface DateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, 'label'>, RenderProps<DateFieldState> {}

interface TimeFieldProps<T extends TimeValue> extends AriaTimeFieldProps<T>, RenderProps<DateFieldState> {}

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
  let [labelRef, label] = useSlot();
  let {labelProps, fieldProps} = useDateField({...props, label}, state, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-DateField'
  });

  return (
    <Provider
      values={[
        [DateInputContext, {state, fieldProps, ref: fieldRef}],
        [LabelContext, {...labelProps, ref: labelRef}]
      ]}>
      <div {...renderProps}>
        {props.children}
      </div>
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
  let [labelRef, label] = useSlot();
  let {labelProps, fieldProps} = useTimeField({...props, label}, state, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-TimeField'
  });

  return (
    <Provider
      values={[
        [DateInputContext, {state, fieldProps, ref: fieldRef}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}]
      ]}>
      <div {...renderProps}>
        {props.children}
      </div>
    </Provider>
  );
}

const InternalDateInputContext = createContext<DateFieldState>(null);

interface DateInputProps extends SlotProps, StyleProps {
  children: (segment: IDateSegment) => ReactElement
}

function DateInput({children, style, className, slot}: DateInputProps, ref: ForwardedRef<HTMLDivElement>) {
  let [{state, fieldProps}, fieldRef] = useContextProps({slot} as DateInputProps & DateInputContextValue, ref, DateInputContext);
  return (
    <InternalDateInputContext.Provider value={state}>
      <div {...fieldProps} ref={fieldRef} slot={slot} style={style} className={className ?? 'react-aria-DateInput'}>
        {state.segments.map((segment, i) => cloneElement(children(segment), {key: i}))}
      </div>
    </InternalDateInputContext.Provider>
  );
}

const _DateInput = forwardRef(DateInput);
export {_DateInput as DateInput};

export interface DateSegmentRenderProps extends Omit<IDateSegment, 'isEditable'> {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /**
   * Whether the segment is read only.
   * @selector [aria-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the date field is in an invalid state.
   * @selector [aria-invalid]
   */
  isInvalid: boolean,
  /**
   * The type of segment. Values include `literal`, `year`, `month`, `day`, etc.
   * @selector [data-type="..."]
   */
  type: DateSegmentType
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
    values: {
      ...segment,
      isReadOnly: !segment.isEditable,
      isInvalid: state.validationState === 'invalid'
    },
    defaultChildren: segment.text,
    defaultClassName: 'react-aria-DateSegment'
  });

  return (
    <div
      {...segmentProps}
      {...renderProps}
      ref={domRef}
      data-type={segment.type} />
  );
}

const _DateSegment = forwardRef(DateSegment);
export {_DateSegment as DateSegment};
