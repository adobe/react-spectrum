import {action} from '@storybook/addon-actions';
// @ts-ignore
import Brush from '../../../../src/Icon/Brush';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {ToolButton} from '../src';

storiesOf('Button/ToolButton', module)
  .add(
    'variant: tool',
    () => render()
  )
  .add(
    'variant: tool with holdAffordance',
    () => render({holdAffordance: true})
  );

function render(props = {}) {
  return (
    <div>
      <ToolButton
        icon={<Brush />}
        onPress={action('press')}
        {...props} />
      <ToolButton
        isSelected
        icon={<Brush />}
        onPress={action('press')}
        {...props} />
      <ToolButton
        onPress={action('press')}
        isDisabled
        {...props}>
        <Brush />
      </ToolButton>
    </div>
  );
}
