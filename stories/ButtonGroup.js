/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
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
import {storiesOf} from '@storybook/react';
import Undo from '../src/Icon/Undo';

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
    <Button variant="tool" value="regionselect" icon={<RegionSelect />} />
  ]
};

const selectedValue = [
  'delete'
];

storiesOf('ButtonGroup', module)
  .add(
    'Default',
    () => (render({...defaultProps}))
  )
  .add(
    'Vertical',
    () => (render({orientation: 'vertical'}))
  )
  .add(
    'allows multiple selection',
    () => (render({multiple: true}))
  )
  .add('single button preselected, controlled',
    () => (render({value: 'bell'}))
  )
  .add('multiple buttons preselected, controlled',
    () => (render({value: ['delete', 'bell'], multiple: true}))
  )
  .add(
    'disabled: true',
    () => (render({value: selectedValue, multiple: true, disabled: true}))
  )
  .add(
    'readOnly: true',
    () => (render({readOnly: true, onClick: action('click')}))
  )
  .add(
    'readOnly: true (vertical)',
    () => (render({readOnly: true, orientation: 'vertical', onClick: action('click')}))
  )
  .add(
    'Tool',
    () => (render({...toolProps}))
  )
  .add(
    'Tool (vertical)',
    () => (render({orientation: 'vertical', ...toolProps}))
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
