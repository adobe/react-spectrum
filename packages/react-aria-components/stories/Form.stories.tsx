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

import {action} from 'storybook/actions';
import {Alert} from '../src/Alert';
import {Button} from '../src/Button';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Meta, StoryFn} from '@storybook/react';
import {Popover} from '../src/Popover';
import React from 'react';
import {Select, SelectValue} from '../src/Select';
import {TextField} from '../src/TextField';
import './styles.css';

export default {
  title: 'React Aria Components/Form',
  component: Form
} as Meta<typeof Form>;

export type FormStory = StoryFn<typeof Form>;


export const FormAutoFillExample: FormStory = () => {
  return (
    <Form
      aria-label="Shipping information"
      onSubmit={e => {
        action('onSubmit')(Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()));
        e.preventDefault();
      }}>
      <TextField>
        <Label>Address</Label>
        <Input name="streetAddress" type="text" id="streetAddress" autoComplete="shipping street-address" />
      </TextField>
      <TextField>
        <Label>City</Label>
        <Input name="city" type="text" id="city" autoComplete="shipping address-level2" />
      </TextField>
      <TextField>
        <Label>State</Label>
        <Input name="state" type="text" id="state" autoComplete="shipping address-level1" />
      </TextField>
      <TextField>
        <Label>Zip</Label>
        <Input name="city" type="text" id="city" autoComplete="shipping postal-code" />
      </TextField>
      <Select name="country" id="country" autoComplete="shipping country">
        <Label>Country</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem>Greece</ListBoxItem>
            <ListBoxItem>Italy</ListBoxItem>
            <ListBoxItem>Spain</ListBoxItem>
            <ListBoxItem>Mexico</ListBoxItem>
            <ListBoxItem>Canada</ListBoxItem>
            <ListBoxItem>United States</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export const FormErrorExample: FormStory = () => {
  return (
    <Form
      style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'start'}}
      submitAction={async (formData) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let name = formData.get('name');
        if (!name) {
          throw {
            issues: [{
              message: 'Enter your name',
              path: ['name']
            }]
          };
        }

        if (name === 'test') {
          throw 'Could not create account. Please try again later.';
        }
      }}>
      {({actionError}) => (<>
        <p>Submit an empty value for a field-level error.<br />Enter "test" to see a form-level error.</p>
        {actionError && 
          <Alert
            style={({isFocusVisible}) => ({
              border: '2px solid red',
              padding: 16,
              outline: isFocusVisible ? '2px solid blue' : undefined,
              outlineOffset: 2
            })}>
            {String(actionError)}
          </Alert>
        }
        <TextField
          name="name"
          style={{display: 'flex', flexDirection: 'column'}}>
          <Label>Name</Label>
          <Input />
          <FieldError style={{color: 'red'}} />
        </TextField>
        <Button type="submit">
          {({isPending}) => isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </>)}
    </Form>
  );
};
