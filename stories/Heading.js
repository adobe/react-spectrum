import Heading from '../src/Heading';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Heading', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'display variant (default)',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'pageTitle variant',
    () => render({variant: 'pageTitle'}),
    {inline: true}
  )
  .addWithInfo(
    'subtitle1 variant',
    () => render({variant: 'subtitle1'}),
    {inline: true}
  )
  .addWithInfo(
    'subtitle2 variant',
    () => render({variant: 'subtitle2'}),
    {inline: true}
  )
  .addWithInfo(
    'subtitle3 variant',
    () => render({variant: 'subtitle3'}),
    {inline: true}
  );

function render(props = {}) {
  return <Heading {...props}>React</Heading>;
}
