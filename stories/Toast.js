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
import {error, success, Toast, warning} from '../src/Toast';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Toast', module)
  .add(
    'Default',
    () => <Toast>Toast is done.</Toast>
  )
  .add(
    'closable',
    () => <Toast closable onClose={action('onClose')}>Toast is done.</Toast>
  )
  .add(
    'actionable',
    () => <Toast closable actionLabel="Undo" onAction={action('onAction')} onClose={action('onClose')}>The thing that you are trying to do the thing to has been archived.</Toast>
  )
  .add(
    'action triggers close',
    () => <Toast closable actionLabel="undo" closeOnAction onAction={action('onAction')} onClose={action('onClose')}>Toast is done.</Toast>
  )
  .add(
    'variant = error',
    () => <Toast closable variant="error">Toast is burnt.</Toast>
  )
  .add(
    'variant = warning',
    () => <Toast closable variant="warning">Toast is burning.</Toast>
  )
  .add(
    'variant = info',
    () => <Toast closable actionLabel="Update" onAction={action('onAction')} variant="info">A new version of Lightroom Classic is now available.</Toast>
  )
  .add(
    'variant = success',
    () => <Toast closable variant="success">Toast is golden brown.</Toast>
  )
  .add(
    'success trigger',
    () => (
      <Button
        onClick={() => {
          success('Great success!', {
            actionLabel: 'undo',
            onClose: action('onClose'),
            onAction: action('onAction')
          });
        }}
        variant="primary">
          Show Toast
      </Button>
    )
  )
  .add(
    'error trigger',
    () => <Button onClick={() => error('Dismal Failure!')} variant="primary">Show Toast</Button>
  )
  .add(
    'warning trigger',
    () => <Button onClick={() => warning('Could be serious!', {role: 'region', 'aria-live': 'off'})} variant="primary">Show Toast</Button>
  )
  .add(
    'warning trigger with action close',
    () => (<Button
      onClick={() => warning('Could be serious!', {
        role: 'region',
        'aria-live': 'off',
        actionLabel: 'undo',
        closeOnAction: true,
        onAction: action('onAction'),
        onClose: action('onClose')
      })}
      variant="primary">Show Toast</Button>)
  )
  .add(
    'no timeout',
    () => (
      <Button
        onClick={() => {
          success("I won't go away!", {
            actionLabel: 'undo',
            onClose: action('onClose'),
            onAction: action('onAction'),
            timeout: 0
          });
        }}
        variant="primary">
        Show Toast
      </Button>
    )
  );
