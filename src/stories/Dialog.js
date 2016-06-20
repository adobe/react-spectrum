import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Button from '../Button';
import Dialog from '../Dialog';

const title = <Dialog.Header>Title</Dialog.Header>;
const content = <Dialog.Content>Content</Dialog.Content>;
const dialogChildren = [title, content];
storiesOf('Dialog', module)
  .add('Default', () => render(dialogChildren))
  .add('Long content', () => render(longMarkup))
  .add('open: false', () => render(dialogChildren, { open: false }))
  .add('closable: false', () => render(dialogChildren, { closable: false }))
  .add('variant: error', () => render(dialogChildren, { variant: 'error' }))
  .add('variant: warning', () => render(dialogChildren, { variant: 'warning' }))
  .add('variant: success', () => render(dialogChildren, { variant: 'success' }))
  .add('variant: help', () => render(dialogChildren, { variant: 'help' }))
  .add('variant: info', () => render(dialogChildren, { variant: 'info' }))
  .add('backdrop: none', () => render(dialogChildren, { backdrop: 'none' }))
  .add('backdrop: static', () => render(dialogChildren, { backdrop: 'static' }));

function render(children, props = {}) {
  return (
    <Dialog
      open
      closable
      onClose={ action('close') }
      footer=""
      { ...props }
    >
      { children }
    </Dialog>
  );
}


const longMarkup = [
  // building an array of children like this will cause react to complain about needing a key
  // since this is not how you will generally build a Dialog this should be fine
  <Dialog.Header>
    Really long content...
  </Dialog.Header>,
  <Dialog.Content>
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
  <Dialog.Footer>
    <Button variant="primary" label="Custom Button" close-dialog onClick={ action('custom-close-button') } />
  </Dialog.Footer>
];
