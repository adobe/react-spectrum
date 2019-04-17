import {action} from '@storybook/addon-actions';
import Pagination from '../src/Pagination';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Pagination', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'button:cta',
    () => render({variant: 'button', mode: 'cta'})
  )
  .add(
    'button:secondary',
    () => render({variant: 'button', mode: 'secondary'})
  )
  .add(
    'explicit',
    () => render({variant: 'explicit', totalPages: 50, onChange: action('onChange')})
  )
  .add(
    'controlled',
    () => render({variant: 'explicit', totalPages: 50, currentPage: 2, onChange: action('onChange')})
  );

function render(props = {}) {
  return (<Pagination {...props} onPrevious={action('onPrevious')} onNext={action('onNext')} />);
}
