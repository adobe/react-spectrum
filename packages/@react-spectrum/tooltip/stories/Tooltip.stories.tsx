import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip} from '../src';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render()
  );

function render() {
  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip>
        Hi, I'm a Tooltip
      </Tooltip>
    </div>
  );
}
