import Progress from '../src/Progress';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Progress', module)
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
    'value: 50',
    () => render({value: 50}),
    {inline: true}
  )
  .addWithInfo(
    'value: 100',
    () => render({value: 100}),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({size: 'S', value: 50}),
    {inline: true}
  )
  .addWithInfo(
    'showPercent: true',
    () => render({showPercent: true, value: 50}),
    {inline: true}
  )
  .addWithInfo(
    'label: React',
    () => render({label: 'React', value: 50}),
    {inline: true}
  )
  .addWithInfo(
    'labelPosition: left',
    () => render({label: 'React', showPercent: true, labelPosition: 'left', value: 50}),
    {inline: true}
  )
  .addWithInfo(
    'labelPosition: top',
    () => render({label: 'React', showPercent: true, labelPosition: 'top', value: 50}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Progress {...props} />
  );
}
