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
import {Content} from '@react-spectrum/view';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import React, {useMemo} from 'react';

let items = [
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 1},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 2},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 3},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 4},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 5},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 6},
  {url: 'https://i.imgur.com/Z7AzH2c.png', width: 1024, height: 683, id: 7}
];


function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

export default {
  title: 'CardView'
}

let actions = {
  onSelectionChange: action('onSelectionChange'),
};

export const DefaultGrid = () => render({});
DefaultGrid.storyName = 'default grid layout with initialized layout';

export const DefaultGridConstructor = () => render({layout: GridLayout});
DefaultGridConstructor.storyName = 'default grid layout w/ layout constructor';

export const isLoadingNoHeight = () => renderNoItems({width: '800px', isLoading: true});
isLoadingNoHeight.storyName = 'isLoading, no height';

export const isLoadingHeight = () => renderNoItems({width: '800px', height: '800px', isLoading: true});
isLoadingHeight.storyName = 'isLoading, set height';

export const emptyNoHeight = () => renderNoItems({width: '800px', renderEmptyState});
emptyNoHeight.storyName = 'empty state, no height';

export const emptyWithHeight = () => renderNoItems({width: '800px', height: '800px', renderEmptyState});
emptyWithHeight.storyName = 'empty, set height';


// TODO add static and dynamic, various layouts, card size, selected keys, disabled keys


function render(props) {
  let gridLayout = useMemo(() => new GridLayout({}), []);
  let {
    layout = gridLayout
  } = props;

  return (
    <CardView  {...actions} layout={layout} items={items} width="800px" height="800px" UNSAFE_style={{background: 'white'}} aria-label="Test CardView">
      {item =>
        <Card key={item.id} src={item.url} />
      }
    </CardView>
  );
}

function renderNoItems(props) {
  let gridLayout = useMemo(() => new GridLayout({}), []);
  let {
    layout = gridLayout
  } = props;

  return (
    <CardView {...props} layout={layout} UNSAFE_style={{background: 'white'}} aria-label="Test CardView">
      {[]}
    </CardView>
  );
}
