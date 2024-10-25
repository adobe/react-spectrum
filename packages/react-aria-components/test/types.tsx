/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable */

// This file is intended to test the TypeScript types of the components.

import React from 'react';
import * as RAC from '../';

// Small version of framer motion's types for testing forwardRef compatibility.
interface MotionProps {
  foo: string
}

declare type CustomDomComponent<Props> = React.ForwardRefExoticComponent<React.PropsWithoutRef<Props & MotionProps> & React.RefAttributes<SVGElement | HTMLElement>>;
declare const motion: <Props extends {}>(Component: string | React.ComponentType<React.PropsWithChildren<Props>>) => CustomDomComponent<Props>;

motion(RAC.Breadcrumbs);
motion(RAC.Button);
motion(RAC.Calendar);
motion(RAC.CalendarGrid);
motion(RAC.CalendarGridHeader);
motion(RAC.CalendarGridBody);
motion(RAC.CalendarHeaderCell);
motion(RAC.CalendarCell);
motion(RAC.RangeCalendar);
motion(RAC.Checkbox);
motion(RAC.CheckboxGroup);
motion(RAC.ComboBox);
motion(RAC.DateField);
motion(RAC.DateInput);
motion(RAC.DateSegment);
motion(RAC.TimeField);
motion(RAC.DatePicker);
motion(RAC.DateRangePicker);
motion(RAC.DialogTrigger);
motion(RAC.Dialog);
motion(RAC.GridList);
motion(RAC.Group);
motion(RAC.Header);
motion(RAC.Heading);
motion(RAC.Input);
motion(RAC.ListBoxItem);
motion(RAC.GridListItem);
motion(RAC.MenuItem);
motion(RAC.MenuSection);
motion(RAC.ListBoxSection);
motion(RAC.Keyboard);
motion(RAC.Label);
motion(RAC.Link);
motion(RAC.ListBox);
motion(RAC.Menu);
motion(RAC.MenuTrigger);
motion(RAC.Meter);
motion(RAC.Modal);
motion(RAC.ModalOverlay);
motion(RAC.NumberField);
motion(RAC.OverlayArrow);
motion(RAC.Popover);
motion(RAC.RadioGroup);
motion(RAC.Radio);
motion(RAC.SearchField);
motion(RAC.Select);
motion(RAC.SelectValue);
motion(RAC.Separator);
motion(RAC.Slider);
motion(RAC.SliderOutput);
motion(RAC.SliderTrack);
motion(RAC.SliderThumb);
motion(RAC.Switch);
motion(RAC.Table);
motion(RAC.Row);
motion(RAC.Cell);
motion(RAC.Column);
motion(RAC.TableHeader);
motion(RAC.TableBody);
motion(RAC.Tabs);
motion(RAC.TabList);
motion(RAC.TabPanel);
motion(RAC.Tab);
motion(RAC.Text);
motion(RAC.TextField);
motion(RAC.ToggleButton);
motion(RAC.Tooltip);
