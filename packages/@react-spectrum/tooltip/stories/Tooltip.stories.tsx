import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'placement: left',
    () => render()
  )
  .add(
    'placement: top',
    () => render()
  )
  .add(
    'placement: bottom',
    () => render()
  )
  .add(
    'variant: neutral',
    () => render()
  )
  .add(
    'variant: positive',
    () => render()
  )
  .add(
    'variant: negative',
    () => render()
  )
  .add(
    'variant: info',
    () => render()
  )
  .add(
    'long content',
    () => render()
  )
  .add(
    'triggered using click',
    () => render()
  )
  .add(
    'triggered using hover',
    () => render()
  );

function render() {
  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip>
        Hi, I'm a Tooltip
      </Tooltip>
    </div>
  );
}

const longMarkup = (
  <div>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
  quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
  ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
  Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
  condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.
  </div>
);
