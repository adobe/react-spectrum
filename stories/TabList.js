import {action, storiesOf} from '@storybook/react';
import React from 'react';
import {Tab, TabList} from '../src/TabList';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('TabList', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'defaultSelectedIndex: 1',
    () => render({defaultSelectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'selectedIndex: 1',
    () => render({selectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'orientation: vertical',
    () => render({orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'orientation: vertical, size: L',
    () => render({orientation: 'vertical', size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: anchored',
    () => render({variant: 'anchored'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: page',
    () => render({variant: 'page'}),
    {inline: true}
  )
  .addWithInfo(
    'icons',
    () => render({icons: true}),
    {inline: true}
  )
  .addWithInfo(
    'icons, orientation: vertical',
    () => render({icons: true, orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled tabs',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon="twitter">Tab 1</Tab>
        <Tab icon="instagram" disabled>Tab 2</Tab>
      </TabList>
    ),
    {inline: true}
  );

function render(props = {}) {
  return (
    <TabList {...props} onChange={action('onChange')}>
      <Tab icon={props.icons && 'twitter'}>Tab 1</Tab>
      <Tab icon={props.icons && 'instagram'}>Tab 2</Tab>
    </TabList>
  );
}
