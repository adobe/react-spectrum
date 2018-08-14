import React from 'react';
import StatusLight from '../src/StatusLight';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('StatusLight', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  ).addWithInfo(
    'variant: celery',
    () => render({variant: 'celery'}),
    {inline: true}
  ).addWithInfo(
    'variant: yellow',
    () => render({variant: 'yellow'}),
    {inline: true}
  ).addWithInfo(
    'variant: fuchsia',
    () => render({variant: 'fuchsia'}),
    {inline: true}
  ).addWithInfo(
    'variant: indigo',
    () => render({variant: 'indigo'}),
    {inline: true}
  ).addWithInfo(
    'variant: seafoam',
    () => render({variant: 'seafoam'}),
    {inline: true}
  ).addWithInfo(
    'variant: chartreuse',
    () => render({variant: 'chartreuse'}),
    {inline: true}
  ).addWithInfo(
    'variant: magenta',
    () => render({variant: 'magenta'}),
    {inline: true}
  ).addWithInfo(
    'variant: purple',
    () => render({variant: 'purple'}),
    {inline: true}
  ).addWithInfo(
    'variant: neutral',
    () => render({variant: 'neutral'}),
    {inline: true}
  ).addWithInfo(
    'variant: active',
    () => render({variant: 'active'}),
    {inline: true}
  ).addWithInfo(
    'variant: positive',
    () => render({variant: 'positive'}),
    {inline: true}
  ).addWithInfo(
    'variant: notice',
    () => render({variant: 'notice'}),
    {inline: true}
  ).addWithInfo(
    'variant: negative',
    () => render({variant: 'negative'}),
    {inline: true}
  ).addWithInfo(
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  );

function render(props = {}) {
  return (<StatusLight {...props}>Status light of love</StatusLight>);
}
