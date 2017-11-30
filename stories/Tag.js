import {action, storiesOf} from '@storybook/react';
import Camera from '../src/Icon/Camera';
import React from 'react';
import {Tag} from '../src/TagList';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Tag', module)
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
    'avatar',
    () => render({avatar: 'https://www.botlibre.com/media/a12832214.png', closable: true}),
    {inline: true}
  )
  .addWithInfo(
    'icon',
    () => render({icon: <Camera />}),
    {inline: true}
  )
  .addWithInfo(
    'closable: true',
    () => render({closable: true}),
    {inline: true}
  );

function render(props = {}, children = 'Cool Tag') {
  return (
    <div>
      <Tag
        value="testValue"
        onClose={action('close')}
        {...props}>
        {props.children || children}
      </Tag>
    </div>
  );
}
