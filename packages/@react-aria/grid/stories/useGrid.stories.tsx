/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Grid} from './example';
import {Item} from '@react-stately/collections';
import React from 'react';
import {Switch} from '@react-spectrum/switch';

export default {
  title: 'useGrid'
};

export const GridFocusModeRowCellFocusModeCell = {
  render: () => render({gridFocusMode: 'row', cellFocusMode: 'cell'}),
  name: 'gridFocusMode = row, cellFocusMode = cell'
};

export const GridFocusModeRowCellFocusModeChild = {
  render: () => render({gridFocusMode: 'row', cellFocusMode: 'child'}),
  name: 'gridFocusMode = row, cellFocusMode = child'
};

export const GridFocusModeCellCellFocusModeChild = {
  render: () => render({gridFocusMode: 'cell', cellFocusMode: 'child'}),
  name: 'gridFocusMode = cell, cellFocusMode = child'
};

export const GridFocusModeCellCellFocusModeCell = {
  render: () => render({gridFocusMode: 'cell', cellFocusMode: 'cell'}),
  name: 'gridFocusMode = cell, cellFocusMode = cell'
};

function render(props = {}) {
  return (
    <Grid {...props}>
      <Item>
        <Switch aria-label="Switch 1" />
        <Switch aria-label="Switch 2" />
      </Item>
      <Item>
        <Switch aria-label="Switch 1" />
        <Switch aria-label="Switch 2" />
        <Switch aria-label="Switch 3" />
      </Item>
      <Item>
        <Switch aria-label="Switch 1" />
        <Switch aria-label="Switch 2" />
      </Item>
    </Grid>
  );
}
