import {action, storiesOf} from '@kadira/storybook';
import React from 'react';
import Tab from '../src/TabList/js/Tab';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Tab', module)
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
    'icon: add',
    () => render({icon: 'add'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'invalid: true',
    () => render({invalid: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Tab {...props} onClick={action('onClick')}>Tab 1</Tab>
  );
}
