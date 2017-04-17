import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../.storybook/layout';

import Progress from '../src/Progress';

storiesOf('Progress', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'value: 50',
    () => render({ value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'value: 100',
    () => render({ value: 100 }),
    { inline: true }
  )
  .addWithInfo(
    'indeterminate: true',
    () => render({ indeterminate: true, value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'size: S',
    () => render({ size: 'S', value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'size: L',
    () => render({ size: 'L', value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'showPercent: true',
    () => render({ showPercent: true, value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'labelPosition: left',
    () => render({ showPercent: true, labelPosition: 'left', value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'labelPosition: bottom',
    () => render({ showPercent: true, labelPosition: 'bottom', value: 50 }),
    { inline: true }
  )
  .addWithInfo(
    'label: React',
    () => render({ label: 'React', value: 50 }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Progress { ...props } />
  );
}
