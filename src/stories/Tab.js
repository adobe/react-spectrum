import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Tab from '../Tab';

storiesOf('Tab', module)
  .addDecorator(story => (
    <div style={ { textAlign: 'left', margin: '0 100px' } }>
      { story() }
    </div>
  ))
  .add('Default', () => render())
  .add('icon: add', () => render({ icon: 'add' }))
  .add('selected: true', () => render({ selected: true }))
  .add('disabled: true', () => render({ disabled: true }));

function render(props = {}) {
  return (
    <Tab { ...props } onClick={ action('onClick') }>Tab 1</Tab>
  );
}
