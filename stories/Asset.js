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

import {Asset} from '../src/Asset';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Asset', module)
  .add(
    'Image',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="image" src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" alt="Shantanu Narayen" />
      </div>
    )
  )
  .add(
    'File',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="file" />
      </div>
    )
  )
  .add(
    'Folder',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="folder" />
      </div>
    )
  )
  .add(
    'Decorative: true',
    () => (
      <div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="image" src="https://a5.behance.net/8adfcc7bd72ed18f2087e4eb472eb174c865716d/img/profile/no-image-138.png?cb=264615658" alt="Shantanu Narayen" decorative />
        </div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="file" decorative />
        </div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="folder" decorative />
        </div>
      </div>
    ),
    {info: 'Use the decorative boolean prop to indicate that the image is decorative, or redundant with displayed text, and should not announced by screen readers.'}
  );
