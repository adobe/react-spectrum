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

import Add from '../src/Icon/Add';
import AdobeExperienceManagerColorLight from '../src/Icon/AdobeExperienceManagerColorLight';
import Bell from '../src/Icon/Bell';
import Icon from '../src/Icon';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Twitter from '../src/Icon/Twitter';

storiesOf('Icon', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'icon: bell',
    () => <Bell />
  )
  .add(
    'icon: Twitter',
    () => <Twitter alt="Twitter" />
  )
  .add(
    'size: XS',
    () => render({size: 'XS'})
  )
  .add(
    'size: S',
    () => render({size: 'S'})
  )
  .add(
    'size: L',
    () => render({size: 'L'})
  )
  .add(
    'size: XL',
    () => render({size: 'XL'})
  )
  .add(
    'Color icon',
    () => <AdobeExperienceManagerColorLight size="XL" alt="Adobe Experience Manager" />
  )
  .add(
    'custom SVG',
    () => <Icon><svg viewBox="0 0 25 25"><rect x="0" y="0" width="25" height="25" /></svg></Icon>
  );

function render(props = {}) {
  return (
    <Add {...props} />
  );
}
