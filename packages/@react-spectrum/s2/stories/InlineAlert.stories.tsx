/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Content, Heading, InlineAlert} from '../src';
import type {Meta} from '@storybook/react';
import {useState} from 'react';

const meta: Meta<typeof InlineAlert> = {
  component: InlineAlert,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'InlineAlert'
};

export default meta;

export const Example = (args: any) => (
  <InlineAlert {...args}>
    <Heading>Payment Information</Heading>
    <Content>
      There was an error processing your payment. Please check that your card information is correct, then try again.
    </Content>
  </InlineAlert>
);

export const DynamicExample = (args: any) => {
  let [shown, setShown] = useState(false);

  return (
    <>
      <Button variant="primary" onPress={() => setShown(!shown)}>{shown ? 'Hide Alert' : 'Show Alert'}</Button>
      {shown &&
        <InlineAlert {...args} autoFocus>
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
      }
    </>
  );
};
