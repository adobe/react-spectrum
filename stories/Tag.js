import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {Tag} from '../src/TagList';

storiesOf('Tag', module)
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
    'color: blue',
    () => render({color: 'blue'}),
    {inline: true}
  )
  .addWithInfo(
    'size: M',
    () => render({size: 'M'}),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({size: 'S'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'closable: true',
    () => render({closable: true}),
    {inline: true}
  )
  .addWithInfo(
    'multiline: true',
    () => render({
      children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel vestibulum neque, eu sollicitudin arcu. Etiam sed dolor egestas, rutrum ante quis, aliquam urna. Cras maximus quis ligula a vulputate. Ut non est sagittis, sodales est ac, ullamcorper libero. Aenean quis elementum velit. Nullam eu nulla lectus. Donec sed est nec mi cursus sodales. Aenean imperdiet tristique suscipit. Aenean varius pellentesque mauris. Nunc scelerisque nibh facilisis quam hendrerit eleifend. Phasellus a dolor enim. Etiam ullamcorper euismod nisl quis accumsan. Pellentesque bibendum vulputate interdum. Duis ut mi sapien. Ut vehicula feugiat erat, et posuere nulla facilisis in.',
      multiline: true
    }),
    {inline: true}
  );

function render(props = {}, children = 'Cool Tag') {
  return (
    <div>
      <Tag
        value="testValue"
        onClose={ action('close') }
        { ...props }
      >
        { props.children || children }
      </Tag>
    </div>
  );
}
