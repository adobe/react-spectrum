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
      <Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" />
    )
  )
  .add(
    'Disabled',
    () => (
      <Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" disabled />
    )
  )
  .add(
    'With alt text',
    () => (
      <Avatar src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" alt="Shantanu Narayen" />
    )
  );
