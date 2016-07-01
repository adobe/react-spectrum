import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Tab from '../Tab';

storiesOf('Tab', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0px 100px' } }>
      { story() }
    </VerticalCenter>
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
