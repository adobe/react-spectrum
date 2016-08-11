import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Icon from '../Icon';

storiesOf('Icon', module)
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
    'icon: bell',
    () => render({ icon: 'bell' }),
    { inline: true }
  )
  .addWithInfo(
    'icon: twitterColor',
    () => render({ icon: 'twitterColor' }),
    { inline: true }
  )
  .addWithInfo(
    'size: XS',
    () => render({ size: 'XS' }),
    { inline: true }
  )
  .addWithInfo(
    'size: S',
    () => render({ size: 'S' }),
    { inline: true }
  )
  .addWithInfo(
    'size: L',
    () => render({ size: 'L' }),
    { inline: true }
  )
  .addWithInfo(
    'size: XL',
    () => render({ size: 'XL' }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Icon icon="add" { ...props } />
  );
}
