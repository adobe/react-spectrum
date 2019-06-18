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
import Rating from '../src/Rating';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Rating', module)
  .add(
    'Default',
    () => (
      <Rating aria-label="Default rating" onChange={action('change')} />
    )
  )
  .add(
    'Disabled',
    () => (
      <Rating aria-label="Disabled rating" disabled value={3} onChange={action('change')} />
    )
  )
  .add(
    'readOnly',
    () => (
      <Rating aria-label="Disabled rating" readOnly value={3} onChange={action('change')} />
    )
  )
  .add(
    'Controlled',
    () => (
      <Rating aria-label="Controlled rating" value={3} onChange={action('change')} />
    )
  ).add(
    'Max',
    () => (
      <Rating aria-label="Number of stars" max={10} onChange={action('change')} />
    )
  );
