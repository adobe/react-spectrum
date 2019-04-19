import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import TagField from '../src/TagField';

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

const OBJECT_OPTIONS = [
  {label: 'Chocolate', id: '1'},
  {label: 'Vanilla', id: '2'},
  {label: 'Strawberry', id: '3'}

];

function getCompletions(text) {
  return OPTIONS.filter(o => ({label: o.name, id: o.id}));
}
function getCompletionsObject(text) {
  return OBJECT_OPTIONS.filter(o => o.label.toLowerCase().startsWith(text.toLowerCase()));
}

storiesOf('TagField', module)
  .add(
    'Default',
    () => (
      <TagField placeholder="Tags" />
    )
  )
  .add(
    'Autocomplete',
    () => (
      <TagField placeholder="Tags" getCompletions={getCompletions} />
    )
  )
  .add(
    'Disallow new tags',
    () => (
      <TagField allowCreate={false} placeholder="Tags" getCompletions={getCompletionsObject} />
    )
  )
  .add(
    'Allow duplicate tags',
    () => (
      <TagField allowDuplicates placeholder="Tags" getCompletions={getCompletionsObject} />
    )
  )
  .add(
    'disabled',
    () => (
      <TagField placeholder="Tags" disabled />
    )
  )
  .add(
    'invalid',
    () => (
      <TagField placeholder="Tags" invalid />
    )
  )
  .add(
    'quiet',
    () => (
      <TagField placeholder="Tags" quiet />
    )
  )
  .add(
    'quiet disabled',
    () => (
      <TagField placeholder="Tags" quiet disabled />
    )
  )
  .add(
    'quiet invalid',
    () => (
      <TagField placeholder="Tags" quiet invalid />
    )
  )
  .add(
    'controlled',
    () => (
      <TagField placeholder="Tags" value={['one', 'two']} onChange={action('change')} />
    )
  );
