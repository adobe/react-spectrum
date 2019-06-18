/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import Button from '../src/Button';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';

const dialogChildren = <span>Content of the dialog</span>;

storiesOf('Dialog', module)
  .addDecorator(story => (
    <div className="test-dialog">
      {story()}
    </div>
  ))
  .add(
    'Default',
    () => render(dialogChildren, {title: 'Dialog title'})
  )
  .add(
    'with confirm button',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK'})
  )
  .add(
    'with confirm and cancel',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'with confirm and cancel function',
    () => render(dialogChildren, {title: 'Dialog title', confirmLabel: 'OK', cancelLabel: 'Cancel', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'with secondary confirmation button',
    () => render(dialogChildren, {title: 'Conflict', confirmLabel: 'Keep Both', secondaryLabel: 'Replace', cancelLabel: 'Cancel', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'with confirm disabled',
    () => render(dialogChildren, {title: 'Dialog title', confirmDisabled: true, confirmLabel: 'OK', cancelLabel: 'Cancel', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'with secondary confirmation disabled',
    () => render(dialogChildren, {title: 'Conflict', confirmDisabled: true, confirmLabel: 'Keep Both', secondaryLabel: 'Replace', cancelLabel: 'Cancel', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'Long content',
    () => render(longMarkup, {title: 'Dialog title', confirmLabel: 'OK'})
  )
  .add(
    'variant: confirmation',
    () => render(dialogChildren, {title: 'Are you sure?', variant: 'confirmation', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'variant: information',
    () => render(dialogChildren, {title: 'Connect to WiFi', variant: 'information', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'variant: destructive',
    () => render(dialogChildren, {title: 'Delete 3 Documents', variant: 'destructive', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'variant: error',
    () => render(dialogChildren, {title: 'Error', variant: 'error', confirmLabel: 'OK'})
  )
  .add(
    'mode: alert',
    () => render(dialogChildren, {title: 'Dialog Title', mode: 'alert', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'mode: fullscreen',
    () => render(dialogChildren, {title: 'Dialog Title', mode: 'fullscreen', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'mode: fullscreenTakeover',
    () => render(dialogChildren, {title: 'Dialog Title', mode: 'fullscreenTakeover', confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'backdropClickable: true',
    () => render(dialogChildren, {title: 'Dialog Title', backdropClickable: true, confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'disableEscKey: true',
    () => render(dialogChildren, {title: 'Requires Confirmation', disableEscKey: true, confirmLabel: 'OK', autoFocusButton: 'confirm', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'autoFocusButton: \'cancel\'',
    () => render(<Textfield aria-label="Textfield" placeholder="Textfield" />, {title: 'Dialog Title', backdropClickable: true, confirmLabel: 'OK', cancelLabel: 'Cancel', autoFocusButton: 'cancel', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'autoFocusButton: \'confirm\'',
    () => render(<Textfield aria-label="Textfield" placeholder="Textfield" />, {title: 'Dialog Title', backdropClickable: true, confirmLabel: 'OK', cancelLabel: 'Cancel', autoFocusButton: 'confirm', onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'autoFocus descendant TextField',
    () => render(<Textfield aria-label="Textfield" placeholder="Textfield" autoFocus />, {title: 'Dialog Title', backdropClickable: true, confirmLabel: 'OK', cancelLabel: 'Cancel'})
  )
  .add(
    'keyboardConfirm: true',
    () => render(<Textfield aria-label="Textfield" placeholder="Textfield" autoFocus />, {title: 'Dialog Title', backdropClickable: true, confirmLabel: 'OK', cancelLabel: 'Cancel', keyboardConfirm: true, onConfirm: action('confirm'), onCancel: action('cancel'), onKeyDown: action('onKeyDown')}),
    {info: 'Setting keyboardConfirm prop to true makes it so pressing the Enter key executes the default action for the Dialog. It is the equivalent of pressing the "Confirm" button.'}
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
