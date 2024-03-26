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

import {Button, FieldError, Form, Input, Label, TextField} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const TextfieldExample = () => {
  return (
    <TextField data-testid="textfield-example">
      <Label>First name</Label>
      <Input />
    </TextField>
  );
};

export const FormExample = (args) => {
  return (
    <Form>
      <TextField name="email" type="email" isRequired {...args}>
        <Label>Email</Label>
        <Input />
        <FieldError />
      </TextField>
      <Button type="submit">Submit</Button>
      <Button type="reset">Reset</Button>
    </Form>
  );
};

FormExample.story = {
  argTypes: {
    isInvalid: {
      control: {
        type: 'boolean'
      }
    }
  }
};
