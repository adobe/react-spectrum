import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render('This is a tooltip.')
  )
  .add(
    'placement: left',
    () => render('This is a tooltip.')
  )
  .add(
    'placement: top',
    () => render('This is a tooltip.')
  )
  .add(
    'placement: bottom',
    () => render('This is a tooltip.')
  )
  .add(
    'variant: neutral',
    () => render('This is a tooltip.')
  )
  .add(
    'variant: positive',
    () => render('This is a tooltip.')
  )
  .add(
    'variant: negative',
    () => render('This is a tooltip.')
  )
  .add(
    'variant: info',
    () => render('This is a tooltip.')
  )
  .add(
    'long content',
    () => render(longMarkup)
  )
  .add(
    'triggered using click',
    () => render('This is a tooltip.')
  )
  .add(
    'triggered using hover',
    () => render('This is a tooltip.')
  );

function render(content, props = {}) {
  if (props.trigger){
    return (
      {/* TODO: add tooltip trigger implementation */}
    );
  }

  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip>
        {content}
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
