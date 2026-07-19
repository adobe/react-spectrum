'use client';
import {useDateRangePicker, type AriaDateRangePickerProps} from 'react-aria/useDateRangePicker';
import {useDateRangePickerState} from 'react-stately/useDateRangePickerState';
import type {DateValue} from '@internationalized/date';
import {Provider} from 'react-aria-components/slots';
import {Group, GroupContext} from 'react-aria-components/Group';
import {DateFieldContext, DateInput, DateSegment} from 'react-aria-components/DateField';
import {Button, ButtonContext} from 'react-aria-components/Button';
import {Label, LabelContext} from 'react-aria-components/Label';
import {DialogContext, OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {Popover, PopoverContext} from 'react-aria-components/Popover';
import {ChevronDown} from 'lucide-react';
import {useRef} from 'react';
import {RangeCalendar} from './RangeCalendar';
import './DateField.css';
import './DateRangePicker.css';
import './Form.css';
import './Popover.css';
import './RangeCalendar.css';

export function DateRangePicker(props: AriaDateRangePickerProps<DateValue>) {
  let state = useDateRangePickerState(props);
  let groupRef = useRef<HTMLDivElement>(null);
  let {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps
  } = useDateRangePicker(props, state, groupRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [ButtonContext, {...buttonProps, isPressed: state.isOpen}],
        [LabelContext, {...labelProps, elementType: 'span'}],
        [DialogContext, dialogProps],
        [OverlayTriggerStateContext, state],
        [PopoverContext, {trigger: 'DateRangePicker', triggerRef: groupRef, placement: 'bottom start'}],
        [DateFieldContext, {slots: {start: startFieldProps, end: endFieldProps}}]
      ]}>
      <div className="react-aria-DateRangePicker">
        <Label>{props.label}</Label>
        <Group className="react-aria-Group inset">
          <div className="date-fields">
            <DateInput slot="start">{segment => <DateSegment segment={segment} />}</DateInput>
            <span aria-hidden="true">–</span>
            <DateInput slot="end">{segment => <DateSegment segment={segment} />}</DateInput>
          </div>
          <Button className="field-Button">
            <ChevronDown />
          </Button>
        </Group>
        <Popover className="react-aria-Popover">
          <RangeCalendar {...calendarProps} />
        </Popover>
      </div>
    </Provider>
  );
}
