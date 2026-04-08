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

import {action} from 'storybook/actions';
import {Button} from '../src/Button';
import clsx from 'clsx';
import {DateField, DateInput, DateSegment} from '../src/DateField';
import {DateValue, fromAbsolute, getLocalTimeZone, parseAbsoluteToLocal} from '@internationalized/date';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {Meta, StoryFn} from '@storybook/react';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {TextField} from '../src/TextField';
import './styles.css';

export default {
  title: 'React Aria Components/DateField',
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second']
    },
    minValue: {
      control: 'date'
    },
    maxValue: {
      control: 'date'
    },
    isRequired: {
      control: 'boolean'
    },
    isInvalid: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    validationBehavior: {
      control: 'select',
      options: ['native', 'aria']
    }
  },
  args: {
    onChange: action('OnChange')
  },
  component: DateField
} as Meta<typeof DateField>;

export type DateFieldStory = StoryFn<Omit<typeof DateField, 'minValue' | 'maxValue'> & {
  minValue?: number,
  maxValue?: number
}>;

export const DateFieldExample: DateFieldStory = (props) => (
  <DateField
    {...props}
    minValue={props.minValue ? fromAbsolute(props.minValue, getLocalTimeZone()) : undefined}
    maxValue={props.maxValue ? fromAbsolute(props.maxValue, getLocalTimeZone()) : undefined}
    data-testid="date-field-example"
    defaultValue={parseAbsoluteToLocal('2024-01-01T01:01:00Z')}>
    <Label style={{display: 'block'}}>Date</Label>
    <DateInput className={styles.field} data-testid2="date-input">
      {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
    </DateInput>
    <FieldError style={{display: 'block'}} />
  </DateField>
);

export const DateFieldAutoFill = (props) => (
  <Form
    onSubmit={e => {
      action('onSubmit')(Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()));
      e.preventDefault();
    }}>
    <TextField>
      <Label>Name</Label>
      <Input name="name" type="text" id="name" autoComplete="name" />
    </TextField>
    <DateField
      {...props}
      name="bday"
      autoComplete="bday"
      defaultValue={parseAbsoluteToLocal('2021-04-07T18:45:22Z')}
      data-testid="date-field-example">
      <Label style={{display: 'block'}}>Date</Label>
      <DateInput className={styles.field} data-testid2="date-input">
        {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
      </DateInput>
      <FieldError style={{display: 'block'}} />
    </DateField>
    <Button type="submit">Submit</Button>
  </Form>
);

let dateActionCache = new Map<string, Promise<void>>();

function DateActionResults({dateKey}: {dateKey: string}) {
  let promise = dateActionCache.get(dateKey);
  if (!promise) {
    dateActionCache.clear();
    promise = new Promise<void>(resolve => setTimeout(resolve, 2000));
    dateActionCache.set(dateKey, promise);
  }
  React.use(promise);
  return <div>Results for: {dateKey || '(empty)'}</div>;
}

export const ReactAction: DateFieldStory = (args) => {
  let [value, setValue] = useState<DateValue | null>(() => parseAbsoluteToLocal('2024-01-01T01:01:00Z'));
  let dateKey = value?.toString() ?? '';
  return (
    <div>
      <DateField
        {...args as any}
        value={value}
        changeAction={async v => {
          setValue(v);
        }}>
        {({isPending}) => (
          <>
            <Label style={{display: 'block'}}>Date</Label>
            <DateInput className={styles.field} data-testid2="date-input">
              {segment => <DateSegment segment={segment} className={clsx(styles.segment, {[styles.placeholder]: segment.isPlaceholder})} />}
            </DateInput>
            {isPending && <ProgressCircle aria-label="Loading" isIndeterminate style={{display: 'inline-block'}} />}
          </>
        )}
      </DateField>
      <React.Suspense fallback="Loading">
        <DateActionResults dateKey={dateKey} />
      </React.Suspense>
    </div>
  );
};
