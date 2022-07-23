import {useRef, createContext, useContext, cloneElement} from 'react';
import {useDateFieldState, useTimeFieldState} from 'react-stately';
import {useDateField, useDateSegment} from 'react-aria';
import {useLocale, FocusScope} from 'react-aria';
import {createCalendar} from '@internationalized/date';
import {LabelContext} from './Label';
import {Provider, useRenderProps} from './utils';

export const DateFieldContext = createContext();

export function DateField(props) {
  let { locale } = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef();
  let { labelProps, fieldProps } = useDateField({...props, label: 's'}, state, fieldRef);

  return (
    <Provider values={[
      [DateFieldContext, {state, fieldProps, fieldRef}],
      [LabelContext, labelProps]
    ]}>
      {props.children}
    </Provider>
  );
}

export function TimeField(props) {
  let { locale } = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef();
  let { labelProps, fieldProps } = useDateField({...props, label: 's'}, state, fieldRef);

  return (
    <Provider values={[
      [DateFieldContext, {state, fieldProps, fieldRef}],
      [LabelContext, labelProps]
    ]}>
        {props.children}
    </Provider>
  );
}

export function DateInput({children, style, className}) {
  let {state, fieldProps, fieldRef} = useContext(DateFieldContext);
  return (
    <div {...fieldProps} ref={fieldRef} style={style} className={className}>
      {state.segments.map((segment, i) => cloneElement(children(segment), {key: i}))}
    </div>
  );
}

export function DateSegment({ segment, className, style, children }) {
  let {state} = useContext(DateFieldContext);
  let ref = useRef();
  let { segmentProps } = useDateSegment(segment, state, ref);
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
      ref={ref} />
  );
}
