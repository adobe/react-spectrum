import {action, storiesOf} from '@storybook/react';
import Autocomplete from '../src/Autocomplete';
import React from 'react';
import Textfield from '../src/Textfield';
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

function getCompletionsAsync(input) {
  if (input === '') {
    return [];
  }
  return fetch(`https://api.github.com/search/users?q=${input}`)
    .then((response) => response.json())
    .then((json) => json.items && json.items.map(item => ({label: item.login, id: item.id})));
}

storiesOf('Autocomplete', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Autocomplete getCompletions={getCompletions} onSelect={action('select')}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    ),
    {inline: true}
  )
  .addWithInfo(
    'allowCreate',
    () => (
      <Autocomplete allowCreate getCompletions={getCompletions} onSelect={action('select')}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Async',
    () => (
      <Autocomplete getCompletions={getCompletionsAsync} onSelect={action('select')}>
        <Textfield placeholder="Github usernames..." />
      </Autocomplete>
    ),
    {inline: true}
  )
  .addWithInfo(
    'renderItem',
    'This example uses renderItem method to italicize text',
    () => (
      <Autocomplete
        getCompletions={getCompletions}
        onSelect={action('select')}
        renderItem={label => <em>{label}</em>}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    ),
    {inline: true}
  );
