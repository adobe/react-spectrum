import Add from '../src/Icon/Add';
import Bell from '../src/Icon/Bell';
import Icon from '../src/Icon';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Icon', module)
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
    'icon: bell',
    () => <Bell />,
    {inline: true}
  )
  .addWithInfo(
    'icon: Twitter',
    () => <Twitter />,
    {inline: true}
  )
  .addWithInfo(
    'size: XS',
    () => render({size: 'XS'}),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({size: 'S'}),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'size: XL',
    () => render({size: 'XL'}),
    {inline: true}
  )
  .addWithInfo(
    'custom SVG',
    () => <Icon><svg viewBox="0 0 25 25"><rect x="0" y="0" width="25" height="25" /></svg></Icon>,
    {inline: true}
  );

function render(props = {}) {
  return (
    <Add {...props} />
  );
}
