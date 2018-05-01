import {action, storiesOf} from '@storybook/react';
import Add from '../src/Icon/Add';
import Bell from '../src/Icon/Bell';
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import ButtonGroup from '../src/ButtonGroup';
import Camera from '../src/Icon/Camera';
import CheckmarkCircle from '../src/Icon/CheckmarkCircle';
import Delete from '../src/Icon/Delete';
import React from 'react';
import RegionSelect from '../src/Icon/RegionSelect';
import Select from '../src/Icon/Select';
import Undo from '../src/Icon/Undo';
import {VerticalCenter} from '../.storybook/layout';

const defaultProps = {
  children: [
    <Button label="React" value="react" icon={<CheckmarkCircle />} />,
    <Button label="Add" value="add" icon={<Add />} />,
    <Button label="Delete" value="delete" icon={<Delete />} />,
    <Button label="Bell" value="bell" icon={<Bell />} />,
    <Button label="Camera" value="camera" icon={<Camera />} />,
    <Button label="Undo" value="undo" icon={<Undo />} />
  ]
};

const toolProps = {
  children: [
    <Button variant="tool" value="brush" icon={<Brush />} />,
    <Button variant="tool" value="select" icon={<Select />} />,
    <Button variant="tool" value="regionselect" icon={<RegionSelect />} />,
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
    'Vertical',
    () => (render({orientation: 'vertical'})),
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
    () => (render({readOnly: true, onClick: action('click')})),
    {inline: true}
  )
  .addWithInfo(
    'Tool',
    () => (render({...toolProps})),
    {inline: true}
  )
  .addWithInfo(
    'Tool (vertical)',
    () => (render({orientation: 'vertical', ...toolProps})),
    {inline: true}
  );

function render(props = {}) {
  return (
    <ButtonGroup
      style={{textAlign: 'left'}}
      aria-label="ButtonGroup"
      onChange={action('change')}
      {...defaultProps}
      {...props} />
  );
}
