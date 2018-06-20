import Banner from '../src/Banner';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Banner', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({header: 'Most Popular', content: 'Includes Illustrator CC'}),
    {inline: true}
  ).addWithInfo(
    'variant: corner',
    () => (
      <div style={{width: '200px', height: '100px', position: 'relative', border: '1px solid black'}}>
        {render({header: 'Most Popular', content: 'Includes Illustrator CC', corner: true})}
      </div>
    ),
    {inline: true}
  ).addWithInfo(
    'variant: warning',
    () => render({header: 'Purchase Soon', content: 'Your trial is about to expire', variant: 'warning'}),
    {inline: true}
  ).addWithInfo(
    'variant: error',
    () => render({header: 'Purchase Soon', content: 'Trial expires in 2 days', variant: 'error'}),
    {inline: true}
  );

function render(props = {}) {
  return (<Banner {...props} />);
}
