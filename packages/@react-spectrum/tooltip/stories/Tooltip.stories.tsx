import {ActionButton} from '@react-spectrum/button';
import {action} from '@storybook/addon-actions';
import {Tooltip, TooltipProps} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render({})
  );

function render({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
        <ActionButton>Tooltip</ActionButton>
        <Tooltip>
        <span><i>Italicized</i> Hi, I'm a tooltip </span>
        </Tooltip>
    </div>
  );
}
