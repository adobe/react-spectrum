/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  Calendar as AriaCalendar,
  CalendarProps as AriaCalendarProps,
  Button,
  ButtonProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  ContextValue,
  DateValue,
  Text
} from 'react-aria-components';
import {ActionButton} from './';
import {Context, createContext, ReactNode, useRef} from 'react';
import {style} from '../style' with {type: 'macro'};
import { Header, Heading } from './Content';
import ChevronRightIcon from '../s2wf-icons/S2_Icon_ChevronRight_20_N.svg';
import ChevronLeftIcon from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import { pressScale } from '..';



export interface CalendarProps<T extends DateValue>
  extends AriaCalendarProps<T> {
  errorMessage?: string
}

export const CalendarContext:
  Context<ContextValue<Partial<CalendarProps<any>>, HTMLDivElement>> =
  createContext<ContextValue<Partial<CalendarProps<any>>, HTMLDivElement>>(null);

const headerStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: 'full'
});

const titleStyles = style({
  font: 'title-lg',
  textAlign: 'center',
  flexGrow: 1
});

const headerCellStyles = style({
  font: 'title-sm',
  textAlign: 'center',
  flexGrow: 1
});

const cellStyles = style({
  outlineStyle: 'none',
  font: 'body-sm',
  width: 24,
  height: 24,
  margin: 2,
  borderRadius: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: {
    isSelected: 'blue-600'
  }
});


export function Calendar<T extends DateValue>(
  {errorMessage, ...props}: CalendarProps<T>
): ReactNode {
  return (
    <AriaCalendar {...props}>
      <Header styles={headerStyles}>
        <CalendarButton slot="previous"><ChevronLeftIcon /></CalendarButton>
        <Heading styles={titleStyles} />
        <CalendarButton slot="next"><ChevronRightIcon /></CalendarButton>
      </Header>
      <CalendarGrid>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className={headerCellStyles}>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell
              date={date}
              className={cellStyles} />
          )}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaCalendar>
  );
}

const CalendarButton = (props: Omit<ButtonProps, 'children'> & {children: ReactNode}) => {
  return (
    <ActionButton
      {...props}
      isQuiet>
      {props.children}
    </ActionButton>
  );
};
