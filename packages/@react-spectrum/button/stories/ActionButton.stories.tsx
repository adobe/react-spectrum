import {action} from '@storybook/addon-actions';
import {ActionButton} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Button/ActionButton', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'holdAffordance',
    () => render({holdAffordance: true})
  )
  .add(
    'selected',
    () => render({isSelected: true})
  )
  .add(
    'quiet',
    () => render({isQuiet: true})
  );

function render(props = {}) {
  return (
    <div>
      <ActionButton
        onPress={action('press')}
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        isDisabled
        {...props}>
        Disabled
      </ActionButton>
    </div>
  );
}
