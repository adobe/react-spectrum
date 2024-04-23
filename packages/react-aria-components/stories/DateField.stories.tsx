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

import {action} from '@storybook/addon-actions';
import clsx from 'clsx';
import {DateField, DateInput, DateSegment, FieldError, Label} from 'react-aria-components';
import {fromAbsolute, getLocalTimeZone, parseAbsoluteToLocal} from '@internationalized/date';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components',
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
    validationBehavior: {
      control: 'select',
      options: ['native', 'aria']
    }
  },
  args: {
    onChange: action('OnChange')
  }
};

export const DateFieldExample = (props) => (
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
