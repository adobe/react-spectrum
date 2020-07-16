/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '../';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {View} from "@react-spectrum/view";

storiesOf('ButtonGroup', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'orientation: vertical, align: end',
    () => render({orientation: 'vertical', align: 'end'})
  )
  .add(
    'isDisabled, orientation: vertical',
    () => render({isDisabled: true, orientation: 'vertical'})
  )
  .add(
    'align: end',
    () => render({align: 'end'})
  )
  .add(
    'align: center',
    () => render({align: 'center'})
  )
  .add(
    'align: center, orientation: vertical',
    () => render({align: 'center', orientation: 'vertical'})
  );

function render(props) {
  return (
    <>
      <View borderColor="static-blue-400" borderWidth="thin">
        <ButtonGroup width="size-4600" {...props}>
          <Button variant="primary">Button 1</Button>
          <Button variant="primary">Button 2</Button>
        </ButtonGroup>
      </View>
      <View borderColor="static-blue-400" borderWidth="thin">
        <ButtonGroup width="size-2000" {...props}>
          <Button variant="primary">Button 1</Button>
          <Button variant="primary">Button 2</Button>
        </ButtonGroup>
      </View>
    </>
  );
}
