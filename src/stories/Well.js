import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Well from '../Well';

storiesOf('Well', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  );

function render(props = {}) {
  return (<Well { ...props }>This is a React Coral Well</Well>);
}
