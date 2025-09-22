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

import {Button, Checkbox, Group, Label, Link, ListBox, Popover, Select, SelectValue, Separator, ToggleButton, Toolbar, ToolbarProps} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {Meta, StoryObj} from '@storybook/react';
import {MyListBoxItem} from './utils';
import {Orientation} from 'react-stately';
import React from 'react';
import styles from '../example/index.css';
import './styles.css';

export default {
  title: 'React Aria Components/Toolbar',
  component: Toolbar
} as Meta<typeof Toolbar>;

export type ToolbarStory = StoryObj<typeof Toolbar>;

export const ToolbarExample: ToolbarStory = {
  args: {
    orientation: 'horizontal' as Orientation
  },
  render: (props: ToolbarProps) => {
    return (
      <div>
        <label htmlFor="before">Input Before Toolbar</label>
        <input id="before" type="text" />
        <Toolbar {...props}>
          <div role="group" aria-label="Text style">
            <ToggleButton className={classNames(styles, 'toggleButtonExample')}><strong>B</strong></ToggleButton>
            <ToggleButton className={classNames(styles, 'toggleButtonExample')}><div style={{textDecoration: 'underline'}}>U</div></ToggleButton>
            <ToggleButton className={classNames(styles, 'toggleButtonExample')}><i>I</i></ToggleButton>
          </div>
          <Checkbox>
            <div className="checkbox">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </div>
            Night Mode
          </Checkbox>
          <Link href="https://google.com">Help</Link>
        </Toolbar>
        <label htmlFor="after">Input After Toolbar</label>
        <input id="after" type="text" />
      </div>
    );
  }
};

export const SelectSupport: ToolbarStory = {
  args: {
    orientation: 'horizontal' as Orientation
  },
  render: (props: ToolbarProps) => {
    return (
      <Toolbar {...props} aria-label="Text formatting">
        <Group aria-label="Style">
          <ToggleButton aria-label="Bold">
            <b>B</b>
          </ToggleButton>
          <ToggleButton aria-label="Italic">
            <i>I</i>
          </ToggleButton>
          <ToggleButton aria-label="Underline">
            <u>U</u>
          </ToggleButton>
        </Group>
        <Separator orientation="vertical" />
        <Select>
          <Label>Favorite Animal</Label>
          <Button>
            <SelectValue />
            <span aria-hidden="true">▼</span>
          </Button>
          <Popover>
            <ListBox>
              <MyListBoxItem>Aardvark</MyListBoxItem>
              <MyListBoxItem>Cat</MyListBoxItem>
              <MyListBoxItem>Dog</MyListBoxItem>
              <MyListBoxItem>Kangaroo</MyListBoxItem>
              <MyListBoxItem>Panda</MyListBoxItem>
              <MyListBoxItem>Snake</MyListBoxItem>
            </ListBox>
          </Popover>
        </Select>
        <Separator orientation="vertical" />

        <Group aria-label="Clipboard">
          <Button>Copy</Button>
          <Button>Paste</Button>
          <Button>Cut</Button>
        </Group>
      </Toolbar>
    );
  }
};
