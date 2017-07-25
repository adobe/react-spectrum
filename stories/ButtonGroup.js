import {action, storiesOf} from '@kadira/storybook';
import Button from '../src/Button';
import ButtonGroup from '../src/ButtonGroup';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

const defaultProps = {
  children: [
    <Button label="React" value="react" icon="checkCircle"/>,
    <Button label="Add" value="add" icon="add"/>,
    <Button label="Delete" value="delete" icon="delete"/>,
    <Button label="Bell" value="bell" icon="bell"/>,
    <Button label="Camera" value="camera" icon="camera"/>,
    <Button label="Undo" value="undo" icon="undo"/>
  ]
};

const selectedValue = [
  'delete'
];

storiesOf('ButtonGroup', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (render({...defaultProps})),
    {inline: true}
  )
  .addWithInfo(
    'multiple selection',
    () => (render({multiple: true})),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => (render({value: selectedValue, multiple: true, disabled: true})),
    {inline: true}
  )
  .addWithInfo(
    'readOnly: true',
    () => (render({readOnly: true})),
    {inline: true}
  );

function render(props = {}) {
  return (
    <ButtonGroup
      style={{textAlign: 'left'}}
      label="ButtonGroup"
      onClick={action('click')}
      {...defaultProps}
      {...props}>
    </ButtonGroup>
  );
}
