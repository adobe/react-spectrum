import Link from '../src/Link';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Link', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'Quiet',
    () => render({variant: 'quiet'})
  )
  .add(
    'Over background',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    )
  );

function render(props = {}) {
  return (<Link href="#" {...props}>This is a React Spectrum Link</Link>);
}
