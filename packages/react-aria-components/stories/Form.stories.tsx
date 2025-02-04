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

import {action} from '@storybook/addon-actions';
import {Button, FileTrigger, Form, Input, Label, ListBox, ListBoxItem, Link, Popover, Select, SelectValue, TextField} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};


export const FormExample = () => {
  return (
    <Form
      onSubmit={e => {
        action('onSubmit')(Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()));
        e.preventDefault();
    }}>
      <TextField data-testid="textfield-example">
        <Label>First name</Label>
        <Input type="text" id="firstName" autoComplete='given-name'/>
      </TextField>
      <Select id="favoriteAnimal" autoComplete='on'>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem>Aardvark</ListBoxItem>
            <ListBoxItem>Cat</ListBoxItem>
            <ListBoxItem>Dog</ListBoxItem>
            <ListBoxItem>Kangaroo</ListBoxItem>
            <ListBoxItem>Panda</ListBoxItem>
            <ListBoxItem>Snake</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

