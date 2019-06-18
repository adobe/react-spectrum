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

import Avatar from '../src/Avatar';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Avatar', module)
  .add(
    'Default',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" />
    )
  )
  .add(
    'Disabled',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" disabled />
    )
  )
  .add(
    'With alt text',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" alt="Shantanu Narayen" />
    )
  );
