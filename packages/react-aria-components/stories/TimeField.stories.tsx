/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import clsx from 'clsx';
import {DateInput, DateSegment, TimeField} from '../src/DateField';
import {Label} from '../src/Label';
import {Meta, StoryFn} from '@storybook/react';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {Time} from '@internationalized/date';
import {TimeValue} from 'react-stately/useTimeFieldState';
import './styles.css';

export default {
  title: 'React Aria Components/TimeField',
  component: TimeField
} as Meta<typeof TimeField>;

export type TimeFieldStory = StoryFn<typeof TimeField>;

export const TimeFieldExample: TimeFieldStory = () => (
  <TimeField data-testid="time-field-example">
    <Label style={{display: 'block'}}>Time</Label>
    <DateInput className={styles.field}>
      {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
    </DateInput>
  </TimeField>
);

let timeActionCache = new Map<string, Promise<void>>();

function TimeActionResults({timeKey}: {timeKey: string}) {
  let promise = timeActionCache.get(timeKey);
  if (!promise) {
    timeActionCache.clear();
    promise = new Promise<void>(resolve => setTimeout(resolve, 2000));
    timeActionCache.set(timeKey, promise);
  }
  React.use(promise);
  return <div>Results for: {timeKey || '(empty)'}</div>;
}

export const ReactAction: TimeFieldStory = (args) => {
  let [value, setValue] = useState<TimeValue | null>(() => new Time(9, 0));
  let timeKey = value?.toString() ?? '';
  return (
    <div>
      <TimeField
        {...args}
        value={value}
        changeAction={async v => {
          setValue(v);
        }}>
        {({isPending}) => (
          <>
            <Label style={{display: 'block'}}>Time</Label>
            <DateInput className={styles.field}>
              {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
            </DateInput>
            {isPending && <ProgressCircle aria-label="Loading" isIndeterminate style={{display: 'inline-block'}} />}
          </>
        )}
      </TimeField>
      <React.Suspense fallback="Loading">
        <TimeActionResults timeKey={timeKey} />
      </React.Suspense>
    </div>
  );
};
