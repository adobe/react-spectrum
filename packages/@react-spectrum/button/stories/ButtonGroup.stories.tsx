import {action} from '@storybook/addon-actions';
import {ActionButton, ButtonGroup} from '../';
import Add from '@spectrum-icons/workflow/Add';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import Delete from '@spectrum-icons/workflow/Delete';
import Bell from '@spectrum-icons/workflow/Bell';
import Camera from '@spectrum-icons/workflow/Camera';
import Undo from '@spectrum-icons/workflow/Undo';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('ButtonGroup', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'tool',
    () => renderIcons({holdAffordance: true})
  )
  .add(
    'vertical tool',
    () => renderIcons({orientation: 'vertical', holdAffordance: true})
  );

const childrenProps =
  [
    {children: 'React', icon: <CheckmarkCircle />},
    {children: 'Add', icon: <Add />},
    {children: 'Delete', icon: <Delete />},
    {children: 'Bell', icon: <Bell />},
    {children: 'Camera', icon: <Camera />},
    {children: 'Undo', icon: <Undo />}
  ];

function render(props = {}) {
  return (
    <ButtonGroup {...props}>
      {
        childrenProps.map(childProps => (
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          {...childProps} />
        ))
      }
    </ButtonGroup>
  );
}

function renderIcons(props = {}) {
  return (
    <ButtonGroup {...props}>
      {
        childrenProps.map(childProps => (
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          icon={childProps.icon} />
        ))
      }
    </ButtonGroup>
  );
}
