import {action, storiesOf} from '@kadira/storybook';
import Button from '../src/Button';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

const dialogChildren = <span>Content of the dialog</span>;

storiesOf('Dialog', module)
  .addDecorator(story => (
    <VerticalCenter className="test-dialog" style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
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
    () => render(longMarkup, {title: 'Dialog title', confirmLabel: 'OK'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: error',
    () => render(dialogChildren, {title: 'Error', variant: 'error', confirmLabel: 'OK'}),
    {inline: true}
  )
  .addWithInfo(
    'mode: fullscreen',
    () => render(dialogChildren, {title: 'Dialog Title', mode: 'fullscreen', confirmLabel: 'OK', cancelLabel: 'Cancel'}),
    {inline: true}
  )
  .addWithInfo(
    'mode: fullscreenTakeover',
    () => render(dialogChildren, {title: 'Dialog Title', mode: 'fullscreenTakeover', confirmLabel: 'OK', cancelLabel: 'Cancel'}),
    {inline: true}
  );

function render(children, props = {}) {
  return (
    <ModalTrigger>
      <Button label="Open Dialog" variant="primary" />
      <Dialog
        open
        onClose={action('close')}
        {...props}>
        {children}
      </Dialog>
    </ModalTrigger>
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
