import {ActionButton} from '@react-spectrum/button';
import {action} from '@storybook/addon-actions';
import {Tooltip} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render({})
  );

function render({width = 'auto', ...props}) {
  return (
    <div style={{display: 'inline-block'}}>
        <Tooltip>
          <span> Hi, I'm a Tooltip </span>
        </Tooltip>
    </div>
  );
}
