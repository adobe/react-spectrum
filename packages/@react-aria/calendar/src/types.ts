import {HTMLAttributes, RefObject} from 'react';
import {PressProps} from '@react-aria/interactions';

type DOMProps = HTMLAttributes<HTMLElement>;
export interface CalendarAria {
  calendarProps: DOMProps,
  calendarTitleProps: DOMProps,
  nextButtonProps: DOMProps & PressProps,
  prevButtonProps: DOMProps & PressProps,
  calendarBodyProps: DOMProps & {ref: RefObject<HTMLTableElement>},
  captionProps: DOMProps & {children: string}
}
