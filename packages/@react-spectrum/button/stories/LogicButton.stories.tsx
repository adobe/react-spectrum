import {action} from '@storybook/addon-actions';
import {LogicButton} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Button/LogicButton', module)
  .add(
    'logic variant: and',
    () => render({variant: 'and', label: 'and'})
  )
  .add(
    'logic variant: or',
    () => render({variant: 'or', label: 'or'})
  );

function render(props = {}) {
  return (
    <div>
      <LogicButton
        onPress={action('press')}
        {...props}>
        Default
      </LogicButton>
      <LogicButton
        onPress={action('press')}
        isDisabled
        {...props}>
        Disabled
      </LogicButton>
    </div>
  );
}
