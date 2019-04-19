import Banner from '../src/Banner';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Banner', module)
  .add(
    'Default',
    () => render({header: 'Most Popular', content: 'Includes Illustrator CC'})
  ).add(
    'variant: corner',
    () => (
      <div style={{width: '200px', height: '100px', position: 'relative', border: '1px solid black'}}>
        {render({header: 'Most Popular', content: 'Includes Illustrator CC', corner: true})}
      </div>
    )
  ).add(
    'variant: warning',
    () => render({header: 'Purchase Soon', content: 'Your trial is about to expire', variant: 'warning'})
  ).add(
    'variant: error',
    () => render({header: 'Purchase Soon', content: 'Trial expires in 2 days', variant: 'error'})
  );

function render(props = {}) {
  return (<Banner {...props} />);
}
