/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '../src/Button';

import {ComboBox} from '../src/ComboBox';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Meta, StoryFn} from '@storybook/react';
import {Popover} from '../src/Popover';
import React from 'react';
import './combobox-reproductions.css';
import './styles.css';


export default {
  title: 'React Aria Components/ComboBoxReproductions',
  component: ComboBox
} as Meta<typeof ComboBox>;

export type ComboBoxReproductionStory = StoryFn<typeof ComboBox>;

export const ComboBoxReproductionExample: ComboBoxReproductionStory = () => (
  <ComboBox>
    <Label>Favorite Animal</Label>
    <div>
      <Input />
      <Button>▼</Button>
    </div>
    <Popover>
      <ListBox>
        <ListBoxItem>Aardvark</ListBoxItem>
        <ListBoxItem>Cat</ListBoxItem>
        <ListBoxItem>Dooooooooooooooooooooooooooooooooog</ListBoxItem>
        <ListBoxItem>Kangaroo</ListBoxItem>
        <ListBoxItem>Panda</ListBoxItem>
        <ListBoxItem>Snake</ListBoxItem>
      </ListBox>
    </Popover>
  </ComboBox>
);
