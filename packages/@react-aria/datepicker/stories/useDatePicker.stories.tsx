/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createCalendar, parseDate} from '@internationalized/date';
import {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useRef} from 'react';
import {useDateField} from '../src';
import {useDateFieldState} from '@react-stately/datepicker';
import {useLocale} from '@react-aria/i18n';

export function ProgrammaticSetValueExampleRender(): ReactElement {
  let {locale} = useLocale();
  let state = useDateFieldState({locale, createCalendar});
  let ref = useRef<HTMLDivElement>(null);
  let {fieldProps} = useDateField({'aria-label': 'Date'}, state, ref);
  return (
    <div>
      <div {...fieldProps} ref={ref} data-testid="field">
        {state.segments.map((seg, i) => <span key={i}>{seg.text}</span>)}
      </div>
      <button onClick={() => state.setValue(parseDate('2020-01-01'))} data-testid="set">Set</button>
    </div>
  );
}

export default {
  title: 'Date and Time/useDatePicker',
  excludeStories: ['ProgrammaticSetValueExampleRender']
} as Meta<typeof ProgrammaticSetValueExampleRender>;

type Story = StoryObj<typeof ProgrammaticSetValueExampleRender>;

export const ProgrammaticSetValueExample: Story = {
  render: () => <ProgrammaticSetValueExampleRender />
};
