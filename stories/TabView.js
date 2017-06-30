import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {TabView, Tab} from '../src/TabView';

storiesOf('TabView', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <TabView onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'orientation = vertical',
    () => (
      <TabView orientation="vertical" onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Controlled',
    () => (
      <TabView selectedIndex={1} onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    ),
    {inline: true}
  );
