import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Autocomplete from '../src/Autocomplete';
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

storiesOf('Autocomplete', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Autocomplete getCompletions={getCompletions}>
        <Textfield placeholder="Autocomplete..." />
      </Autocomplete>
    ),
    {inline: true}
  );
