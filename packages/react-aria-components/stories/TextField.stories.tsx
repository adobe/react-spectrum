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

import {classNames} from '@adobe/react-spectrum/private/utils/classNames';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {TextField} from '../src/TextField';
import './styles.css';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';

export default {
  title: 'React Aria Components/TextField',
  component: TextField
} as Meta<typeof TextField>;

export type TextFieldStory = StoryFn<typeof TextField>;

export const TextfieldExample: TextFieldStory = () => {
  return (
    <TextField data-testid="textfield-example">
      <Label>First name</Label>
      <Input />
    </TextField>
  );
};

export const TextFieldSubmitExample: TextFieldStory = (args) => {
  return (
    <Form>
      <TextField className={classNames(styles, 'textfieldExample')} name="email" type="email" isRequired {...args}>
        <Label>Email</Label>
        <Input />
        <FieldError className={classNames(styles, 'errorMessage')} />
      </TextField>
      <Button type="submit">Submit</Button>
      <Button type="reset">Reset</Button>
    </Form>
  );
};

TextFieldSubmitExample.story = {
  argTypes: {
    isInvalid: {
      control: {
        type: 'boolean'
      }
    }
  },
  parameters: {
    description: {
      data: 'Non controlled isInvalid should render the default error message (aka just hit submit and see that it appears). Controlled isInvalid=true should not render the error message div (aka no padding should appear between the input and the buttons).'
    }
  }
};

export const ReactAction: TextFieldStory = () => {
  let [search, setSearch] = useState('');
  return (
    <div>
      <TextField
        data-testid="textfield-example"
        changeAction={async value => {
          if (value === 'error') {
            throw new Error('Error in action');
          } else {
            setSearch(value);
          }
        }}>
        {({isPending}) => (
          <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
            <Label>Name</Label>
            <Input />
            {isPending && <ProgressCircle aria-label="Loading" isIndeterminate style={{position: 'absolute', right: 0}} />}
            <FieldError style={{color: 'red'}} />
          </div>
        )}
      </TextField>
      <React.Suspense fallback="Loading">
        <Results search={search} />
      </React.Suspense>
    </div>
  );
};

let cache = new Map();

function Results({search}) {
  let promise = cache.get(search);
  if (!promise) {
    cache.clear();
    promise = new Promise(resolve => setTimeout(resolve, 2000));
    cache.set(search, promise);
  }

  React.use(promise);
  return <div>Results for: {search}</div>;
}
