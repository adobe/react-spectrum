import {action} from '@storybook/addon-actions';
import {Tooltip, TooltipProps} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render({})
  );

function render(props:TooltipProps = {}) {
  return (
    <Tooltip {...props}>
    </Tooltip>
  );
}
