'use client';
import {useDatePicker, type AriaDatePickerProps} from 'react-aria/useDatePicker';
import {useDatePickerState} from 'react-stately/useDatePickerState';
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
import {Calendar} from './Calendar';
import './Calendar.css';
import './DateField.css';
import './DatePicker.css';
import './Form.css';
import './Popover.css';

export function DatePicker(props: AriaDatePickerProps<DateValue>) {
  let state = useDatePickerState(props);
  let groupRef = useRef<HTMLDivElement>(null);
  let {groupProps, labelProps, fieldProps, buttonProps, dialogProps, calendarProps} =
    useDatePicker(props, state, groupRef);

  return (
    <Provider
      values={[
        [GroupContext, {...groupProps, ref: groupRef}],
        [DateFieldContext, fieldProps],
        [ButtonContext, {...buttonProps, isPressed: state.isOpen}],
        [LabelContext, {...labelProps, elementType: 'span'}],
        [DialogContext, dialogProps],
        [OverlayTriggerStateContext, state],
        [PopoverContext, {trigger: 'DatePicker', triggerRef: groupRef, placement: 'bottom start'}]
      ]}>
      <div className="react-aria-DatePicker">
        <Label>{props.label}</Label>
        <Group className="react-aria-Group inset">
          <DateInput>{segment => <DateSegment segment={segment} />}</DateInput>
          <Button className="field-Button">
            <ChevronDown />
          </Button>
        </Group>
        <Popover className="react-aria-Popover">
          <Calendar {...calendarProps} />
        </Popover>
      </div>
    </Provider>
  );
}
