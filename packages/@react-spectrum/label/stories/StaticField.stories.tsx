import React from 'react';
import {StaticField} from '../src/StaticField';
import {storiesOf} from '@storybook/react';

storiesOf('StaticField', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: Test (controlled)',
    () => render({value: 'Test'})
  );

function render(props = {}) {
  return (
    <StaticField
      value="test"
      label="test"
      {...props} />
  );
}

