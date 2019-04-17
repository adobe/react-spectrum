import {action} from '@storybook/addon-actions';
import Autocomplete from '../src/Autocomplete';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';

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

function getCompletionsAsync(input) {
  if (input === '') {
    return [];
  }
  return fetch(`https://api.github.com/search/users?q=${input}`)
    .then((response) => response.json())
    .then((json) => json.items && json.items.map(item => ({label: item.login, id: item.id})));
}

storiesOf('Autocomplete', module)
  .add(
    'Default',
    () => (
      <Autocomplete getCompletions={getCompletions} onSelect={action('select')}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    )
  )
  .add(
    'allowCreate',
    () => (
      <Autocomplete allowCreate getCompletions={getCompletions} onSelect={action('select')}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    )
  )
  .add(
    'Async',
    () => (
      <Autocomplete getCompletions={getCompletionsAsync} onSelect={action('select')}>
        <Textfield placeholder="Github usernames..." />
      </Autocomplete>
    )
  )
  .add(
    'Controlled',
    () => (
      <Autocomplete getCompletions={getCompletionsAsync} value="foo" showMenu={false} onMenuToggle={action('toggle')}>
        <Textfield placeholder="Github usernames..." />
      </Autocomplete>
    )
  )
  .add(
    'renderItem',
    () => (
      <Autocomplete
        getCompletions={getCompletions}
        onSelect={action('select')}
        renderItem={item => <em>{item}</em>}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    ),
    {info: 'This example uses renderItem method to italicize text'}
  );
