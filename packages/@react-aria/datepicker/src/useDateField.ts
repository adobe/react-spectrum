import {DatePickerProps} from '@react-types/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, MouseEvent} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useFocusManager} from '@react-aria/focus';
import {useLabels} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface DateFieldAria {
  fieldProps: HTMLAttributes<HTMLElement>,
  segmentProps: DOMProps
}

export function useDateField(props: DatePickerProps & DOMProps): DateFieldAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let fieldProps = useLabels(props, formatMessage('date'));
  let focusManager = useFocusManager();

  // This is specifically for mouse events, not touch or keyboard.
  // Focus the last segment on mouse down in the field.
  let onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusManager.focusPrevious({from: e.target as HTMLElement});
  };

  return {
    fieldProps: {
      ...fieldProps,
      onMouseDown
    },
    segmentProps: {
      // Segments should be labeled by the input id if provided, otherwise the field itself
      'aria-labelledby': fieldProps['aria-labelledby'] || fieldProps.id
    }
  };
}
