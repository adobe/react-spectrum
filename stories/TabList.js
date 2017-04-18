import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import TabList from '../src/TabList';
import Tab from '../src/TabList/js/Tab';

storiesOf('TabList', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
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
  );

function render(props = {}) {
  return (
    <TabList { ...props } onChange={ action('onChange') }>
      <Tab>Tab 1</Tab>
      <Tab>Tab 2</Tab>
    </TabList>
  );
}
