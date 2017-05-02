import {action, storiesOf} from '@kadira/storybook';
import React from 'react';
import TagField from '../src/TagField';
import {VerticalCenter} from '../.storybook/layout';

const OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Strawberry',
  'Caramel',
  'Cookies and Cream',
  'Coconut',
  'Peppermint',
  'Some crazy long value that should be cut off'
];

function getCompletions(text) {
  return OPTIONS.filter(o => o.toLowerCase().startsWith(text.toLowerCase()));
}

storiesOf('TagField', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <TagField placeholder="Tags" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'Autocomplete',
    () => (
      <TagField placeholder="Tags" getCompletions={getCompletions} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => (
      <TagField placeholder="Tags" disabled />
    ),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    () => (
      <TagField placeholder="Tags" invalid />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => (
      <TagField placeholder="Tags" quiet />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => (
      <TagField placeholder="Tags" quiet disabled />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet invalid',
    () => (
      <TagField placeholder="Tags" quiet invalid />
    ),
    {inline: true}
  )
  .addWithInfo(
    'controlled',
    () => (
      <TagField placeholder="Tags" value={['one', 'two']} onChange={action('change')} />
    ),
    {inline: true}
  );
