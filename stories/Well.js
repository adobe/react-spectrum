import React from 'react';
import {storiesOf} from '@storybook/react';

import Well from '../src/Well';

storiesOf('Well', module)
  .add(
    'Default',
    () => render()
  );

function render(props = {}) {
  return (<Well {...props}>This is a React Spectrum Well</Well>);
}
