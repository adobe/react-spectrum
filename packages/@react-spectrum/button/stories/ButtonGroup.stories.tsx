import {action} from '@storybook/addon-actions';
import {ActionButton, ButtonGroup} from '../';
import Add from '@spectrum-icons/workflow/Add';
import Bell from '@spectrum-icons/workflow/Bell';
import Brush from '@spectrum-icons/workflow/Brush';
import Camera from '@spectrum-icons/workflow/Camera';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import Delete from '@spectrum-icons/workflow/Delete';
import React from 'react';
import RegionSelect  from '@spectrum-icons/workflow/RegionSelect';
import Select  from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';
import Undo from '@spectrum-icons/workflow/Undo';

storiesOf('ButtonGroup', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isConnected',
    () => render({isConnected: true})
  )
  .add(
    'isJustefied, isConected',
    () => (
      <div style={{width: '600px'}}>
        {render({isConnected: true, isJustified: true})}
      </div>
    )
  )
  .add(
    'selectionMode: multiple',
    () => render({selectionMode: 'multiple'})
  )
  .add(
    'selectionMode: none',
    () => render({selectionMode: 'none'})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'icons only',
    () => renderToolIcons({})
  )
  .add(
    'icons only, isQuiet',
    () => renderToolIcons({isQuiet: true})
  )
  .add(
    'icons only, orientation: vertical',
    () => renderToolIcons({orientation: 'vertical'})
  )
  .add(
    'icons only, orientation: vertical, isQuiet',
    () => renderToolIcons({orientation: 'vertical', isQuiet: true})
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

const toolIcons =
  [
    {icon: <Brush />},
    {icon: <Select />},
    {icon: <RegionSelect />}
  ];


function render(props = {}) {
  return (
    <ButtonGroup onSelectionChange={action('onSelect')} {...props}>
      {
        childrenProps.map((childProps, index) => (
          <ActionButton key={index} {...childProps} />
        ))
      }
    </ButtonGroup>
  );
}

function renderToolIcons(props = {}) {
  return (
    <ButtonGroup {...props}>
      {
        toolIcons.map((childProps, index) => (
          <ActionButton key={index} {...childProps} />
        ))
      }
    </ButtonGroup>
  );
}
