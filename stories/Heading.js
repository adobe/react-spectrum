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

import Heading from '../src/Heading';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Heading', module)
  .add(
    'display variant (default)',
    () => render()
  )
  .add(
    'pageTitle variant',
    () => render({variant: 'pageTitle'})
  )
  .add(
    'subtitle1 variant',
    () => render({variant: 'subtitle1'})
  )
  .add(
    'subtitle2 variant',
    () => render({variant: 'subtitle2'})
  )
  .add(
    'subtitle3 variant',
    () => render({variant: 'subtitle3'})
  );

function render(props = {}) {
  return <Heading {...props}>React</Heading>;
}
