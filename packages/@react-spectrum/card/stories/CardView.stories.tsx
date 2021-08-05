/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {Card, CardView, GridLayout} from '../';
import {SpectrumCardViewProps} from '@react-types/card';
import React, {useMemo} from 'react';
import {storiesOf} from '@storybook/react';

let items = [
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 1},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 2},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 3},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 4}
];

// TODO add static and dynamic, various layouts
storiesOf('CardView', module)
  .add(
    'default grid layout',
    () => render({layout: GridLayout})
  )
  .add(
    'isLoading',
    () => (
      <CardView layout={GridLayout} isLoading width="800px">
        {[]}
      </CardView>
    )
  )
  .add(
    'empty state',
    () => (
      <CardView layout={GridLayout} width="800px">
        {[]}
      </CardView>
    )
  );

function render(props) {
  let {layout} = props;
  return (
    <CardView layout={layout} items={items} width="800px" height="200px">
      {item =>
        <Card key={item.id} src={item.url} />
      }
    </CardView>
  );
}
