/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import FieldLabel from '../src/FieldLabel';
import Rating from '../src/Rating';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Rating', module)
  .add(
    'Default',
    () => (
      <Rating onChange={action('change')} />
    )
  )
  .add(
    'Disabled',
    () => (
      <Rating disabled value={3} onChange={action('change')} />
    )
  )
  .add(
    'readOnly',
    () => (
      <Rating readOnly value={3} onChange={action('change')} />
    )
  )
  .add(
    'with defaultValue',
    () => (
      <Rating defaultValue={3} onChange={action('change')} />
    )
  )
  .add(
    'Controlled',
    () => (
      <Rating value={3} onChange={action('change')} />
    )
  )
  .add(
    'Max',
    () => (
      <Rating max={10} onChange={action('change')} />
    )
  )
  .add(
    'labelled with FieldLabel',
    () => (
      <FieldLabel label="Rating">
        <Rating defaultValue={3} onChange={action('change')} />
      </FieldLabel>
    )
  )
  .add(
    'valueTextStrings',
    () => (
      <FieldLabel label="Rate your experience">
        <Rating
          valueTextStrings={[
            'No rating',
            '1 Star (Poor)',
            '2 Stars (Fair)',
            '3 Stars (Average)',
            '4 Stars (Good)',
            '5 Stars (Excellent)'
          ]}
          defaultValue={3}
          onChange={action('change')} />
      </FieldLabel>
    )
  )
  .add(
    'Quiet: with defaultValue',
    () => (
      <Rating quiet defaultValue={3} onChange={action('change')} />
    )
  )
  .add(
    'Quiet: controlled',
    () => (
      <Rating quiet value={3} onChange={action('change')} />
    )
  )
  .add(
    'Quiet: disabled',
    () => (
      <Rating quiet disabled defaultValue={3} onChange={action('change')} />
    )
  )
  .add(
    'Quiet: readOnly',
    () => (
      <Rating quiet readOnly defaultValue={3} onChange={action('change')} />
    )
  );
