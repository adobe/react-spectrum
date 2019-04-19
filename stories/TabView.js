import {action} from '@storybook/addon-actions';
import Facebook from '../src/Icon/Facebook';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tab, TabView} from '../src/TabView';
import Twitter from '../src/Icon/Twitter';

storiesOf('TabView', module)
  .add(
    'Default',
    () => (
      <TabView onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    )
  )
  .add(
    'orientation = vertical',
    () => (
      <TabView orientation="vertical" onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    )
  )
  .add(
    'orientation = vertical, icons',
    () => (
      <TabView orientation="vertical" onSelect={action('onSelect')}>
        <Tab icon={<Twitter />}>Tab Body 1</Tab>
        <Tab icon={<Facebook />}>Tab Body 2</Tab>
      </TabView>
    )
  )
  .add(
    'Controlled',
    () => (
      <TabView selectedIndex={1} onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    )
  );
