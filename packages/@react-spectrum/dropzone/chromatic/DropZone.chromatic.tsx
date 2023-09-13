/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '@react-spectrum/button';
import {DropZone, SpectrumDropZoneProps} from '../';
import {FileTrigger, Text} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Meta} from '@storybook/react';
import React from 'react';
import Upload from '@spectrum-icons/illustrations/Upload';

const meta: Meta<SpectrumDropZoneProps> = {
  title: 'DropZone',
  component: DropZone
};

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <IllustratedMessage>
          <Upload />
          <Heading>
            <Text slot="label">
              Drag and drop here
            </Text>
          </Heading>
        </IllustratedMessage>
      </>
    )
  }
};

export const WithFileTrigger = {
  args: {
    children: (
      <>
        <IllustratedMessage>
          <Upload />
          <Heading>
            <Text slot="label">
              Drag and drop here
            </Text>
          </Heading>
          <FileTrigger>
            <Button variant="primary">Select a file</Button>
          </FileTrigger>
        </IllustratedMessage>
      </>
    )
  }
};
