import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from '../src/Button';
import Dialog from '../src/Dialog';

const title = <Dialog.Header key="header">Title</Dialog.Header>;
const content = <Dialog.Content key="content">Content</Dialog.Content>;
const footer = <Dialog.Footer key="footer" />;
const dialogChildren = [title, content, footer];

storiesOf('Dialog', module)
  .addWithInfo(
    'Default',
    () => render(dialogChildren),
    { inline: true }
  )
  .addWithInfo(
    'fullscreen: true',
    () => render(dialogChildren, { fullscreen: true }),
    { inline: true }
  )
  .addWithInfo(
    'Long content',
    () => render(longMarkup),
    { inline: true }
  )
  .addWithInfo(
    'open: false',
    () => render(dialogChildren, { open: false }),
    { inline: true }
  )
  .addWithInfo(
    'closable: false',
    () => render(dialogChildren, { closable: false }),
    { inline: true }
  )
  .addWithInfo(
    'variant: error',
    () => render(dialogChildren, { variant: 'error' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: warning',
    () => render(dialogChildren, { variant: 'warning' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: success',
    () => render(dialogChildren, { variant: 'success' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: help',
    () => render(dialogChildren, { variant: 'help' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: info',
    () => render(dialogChildren, { variant: 'info' }),
    { inline: true }
  )
  .addWithInfo(
    'backdrop: none',
    () => render(dialogChildren, { backdrop: 'none' }),
    { inline: true }
  )
  .addWithInfo(
    'backdrop: static',
    () => render(dialogChildren, { backdrop: 'static' }),
    { inline: true }
  );

function render(children, props = {}) {
  return (
    <Dialog
      open
      closable
      onClose={ action('close') }
      { ...props }
    >
      { children }
    </Dialog>
  );
}


const longMarkup = [
  // building an array of children like this will cause react to complain about needing a key
  // since this is not how you will generally build a Dialog this should be fine
  <Dialog.Header key="header">
    Really long content...
  </Dialog.Header>,
  <Dialog.Content key="content">
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
  </Dialog.Content>,
  <Dialog.Footer key="footer">
    <Button variant="primary" label="Custom Button" close-dialog onClick={ action('custom-close-button') } />
  </Dialog.Footer>
];
