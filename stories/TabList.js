import {action, storiesOf} from '@storybook/react';
import Instagram from '../src/Icon/Instagram';
import React from 'react';
import {Tab, TabList} from '../src/TabList';
import Twitter from '../src/Icon/Twitter';
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
    'orientation: vertical',
    () => render({orientation: 'vertical'}),
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
    'icons only',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />} />
        <Tab icon={<Instagram />} />
      </TabList>
    ),
    {inline: true}
  )
  .addWithInfo(
    'disabled tabs',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />}>Tab 1</Tab>
        <Tab icon={<Instagram />} disabled>Tab 2</Tab>
      </TabList>
    ),
    {inline: true}
  );

function render(props = {}) {
  return (
    <TabList {...props} onChange={action('onChange')}>
      <Tab icon={props.icons && <Twitter />}>Tab 1</Tab>
      <Tab icon={props.icons && <Instagram />}>Tab 2</Tab>
    </TabList>
  );
}
