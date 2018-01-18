import {action, storiesOf} from '@storybook/react';
import Facebook from '../src/Icon/Facebook';
import React from 'react';
import {Tab, TabView} from '../src/TabView';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

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
    'orientation = vertical, icons',
    () => (
      <TabView orientation="vertical" onSelect={action('onSelect')}>
        <Tab icon={<Twitter />}>Tab Body 1</Tab>
        <Tab icon={<Facebook />}>Tab Body 2</Tab>
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
