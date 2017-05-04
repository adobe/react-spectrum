import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import Dialog from '../src/Dialog';

const dialogChildren = <span>Content of the dialog</span>;

storiesOf('Dialog', module)
  .addWithInfo(
    'Default',
    () => render(dialogChildren, {title: 'Dialog title'}),
    {inline: true}
  )
  .addWithInfo(
    'with confirm button',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK'}),
    {inline: true}
  )
  .addWithInfo(
    'with confirm and cancel',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK', cancelLabel: 'Cancel'}),
    {inline: true}
  )
  .addWithInfo(
    'with confirm function',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK', cancelLabel: 'Cancel', onConfirm: action('confirm')}),
    {inline: true}
  )
  .addWithInfo(
    'Long content',
    () => render(longMarkup, {title: 'Dialog title'}),
    {inline: true}
  )
  .addWithInfo(
    'open: false',
    () => render(dialogChildren, {open: false}),
    {inline: true}
  )
  .addWithInfo(
    'variant: error',
    () => render(dialogChildren, {title: 'Error', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: warning',
    () => render(dialogChildren, {title: 'Warning', variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: success',
    () => render(dialogChildren, {title: 'Success', variant: 'success'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: help',
    () => render(dialogChildren, {title: 'Help', variant: 'help'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: info',
    () => render(dialogChildren, {title: 'Info', variant: 'info'}),
    {inline: true}
  );

function render(children, props = {}) {
  return (
    <Dialog
      open
      onClose={action('close')}
      {...props}>
        {children}
    </Dialog>
  );
}

const longMarkup = (
  <div>
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
  </div>
);
