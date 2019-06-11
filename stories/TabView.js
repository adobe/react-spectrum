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
  )
  .add(
    'defaultSelectedIndex: 1',
    () => (
      <TabView defaultSelectedIndex={1} onSelect={action('onSelect')}>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
      </TabView>
    )
  )
  .add(
    'collapsible',
    () => (
      <TabView defaultSelectedIndex={4} onSelect={action('onSelect')} collapsible>
        <Tab label="Tab 1">Tab Body 1</Tab>
        <Tab label="Tab 2">Tab Body 2</Tab>
        <Tab label="Tab 3">Tab Body 3</Tab>
        <Tab label="Tab 4">Tab Body 4</Tab>
        <Tab label="Tab 5">Tab Body 5</Tab>
        <Tab label="Tab 6">Tab Body 6</Tab>
        <Tab label="Tab 7">Tab Body 7</Tab>
        <Tab label="Tab 8">Tab Body 8</Tab>
        <Tab label="Tab 9">Tab Body 9</Tab>
        <Tab label="Tab 10">Tab Body 10</Tab>
      </TabView>
    )
  );
