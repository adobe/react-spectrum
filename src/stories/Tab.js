import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Tab from '../Tab';

storiesOf('Tab', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'icon: add',
    () => render({ icon: 'add' }),
    { inline: true }
  )
  .addWithInfo(
    'selected: true',
    () => render({ selected: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ disabled: true }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Tab { ...props } onClick={ action('onClick') }>Tab 1</Tab>
  );
}
