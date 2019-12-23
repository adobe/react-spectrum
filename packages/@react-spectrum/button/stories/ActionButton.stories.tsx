import {action} from '@storybook/addon-actions';
import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Button/ActionButton', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'icon',
    () => render({icon: <Add />})
  )
  .add(
    'icon only',
    () => renderNoText({icon: <Add />})
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
    'selected, isEmphasized',
    () => render({isEmphasized: true, isSelected: true})
  )
  .add(
    'quiet,',
    () => render({isQuiet: true})
  )
  .add(
    'quiet, selected',
    () => render({isQuiet: true, isSelected: true})
  )
  .add(
    'quiet, isEmphasized',
    () => render({isQuiet: true, isEmphasized: true})
  )
  .add(
    'quiet, selected, isEmphasized',
    () => render({isQuiet: true, isEmphasized: true, isSelected: true})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  );

function render(props = {}) {
  return (
    <div>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        Disabled
      </ActionButton>
    </div>
  );
}

function renderNoText(props = {}) {
  return (
    <div>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props} />
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props} />
    </div>
  );
}
