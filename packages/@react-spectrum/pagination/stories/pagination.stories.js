import {action} from '@storybook/addon-actions';
import {PaginationInput} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('PaginationInput', module)
  .add(
    'Default',
    () => render({maxValue: '10', onChange: action('onChange')})
  )
  .add(
    'controlled',
    () => render({maxValue: '50', value: '2', onChange: action('onChange')})
  );

function render(props = {}) {
  return (<PaginationInput {...props} onPrevious={action('onPrevious')} onNext={action('onNext')} />);
}
