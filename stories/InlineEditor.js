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
import InlineEditor from '../src/InlineEditor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('InlineEditor', module)
  .add(
    'Default',
    () => <InlineEditor defaultValue="test" onChange={action('onChange')} />
  )
  .add(
    'disabled',
    () => <InlineEditor defaultValue="test" disabled onChange={action('onChange')} />
  )
  .add(
    'controlled',
    () => <InlineEditor value="test" onChange={action('onChange')} />
  )
  .add(
    'validate',
    () => (<InlineEditor
      defaultValue="0000000000"
      placeholder="Enter 10 digit cell no"
      onChange={(value) => {
        action('onChange')(value);
        return RegExp(/^\d{10}$/).test(value);
      }} />)
  );
