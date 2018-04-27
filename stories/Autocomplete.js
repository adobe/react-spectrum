import {action, storiesOf} from '@storybook/react';
import Autocomplete from '../src/Autocomplete';
import FieldLabel from '../src/FieldLabel';
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
      <FieldLabel label="Autocomplete...">
        <Autocomplete getCompletions={getCompletions} onSelect={action('select')}>
          <Textfield placeholder="Autocomplete..." />
        </Autocomplete>
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'allowCreate',
    () => (
      <FieldLabel label="Autocomplete...">
        <Autocomplete allowCreate getCompletions={getCompletions} onSelect={action('select')}>
          <Textfield placeholder="Autocomplete..." />
        </Autocomplete>
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Async',
    () => (
      <FieldLabel label="Github usernames...">
        <Autocomplete getCompletions={getCompletionsAsync} onSelect={action('select')}>
          <Textfield placeholder="Github usernames..." />
        </Autocomplete>
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'labelled with FieldLabel and labelFor',
    () => (
      <div>
        <FieldLabel label="Github usernames..." labelFor="autocomplete-input-id" />
        <Autocomplete getCompletions={getCompletionsAsync} onSelect={action('select')}>
          <Textfield id="autocomplete-input-id" placeholder="Github usernames..." />
        </Autocomplete>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'labelled with aria-label',
    () => (
      <Autocomplete getCompletions={getCompletionsAsync} onSelect={action('select')}>
        <Textfield aria-label="Github usernames..." placeholder="Github usernames..." />
      </Autocomplete>
    ),
    {inline: true}
  );
