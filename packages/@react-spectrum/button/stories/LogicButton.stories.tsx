import {action} from '@storybook/addon-actions';
import {LogicButton} from '../';
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

function render(props: any = {}) {
  return (
    <div>
      <LogicButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}
        {...props}>
        Default
      </LogicButton>
      <LogicButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}
        isDisabled
        {...props}>
        Disabled
      </LogicButton>
    </div>
  );
}
