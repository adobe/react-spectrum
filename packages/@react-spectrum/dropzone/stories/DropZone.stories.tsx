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

import {action} from '@storybook/addon-actions';
import {Content} from '@react-spectrum/view';
import {DropZone} from '../';
import {FileTrigger} from 'react-aria-components';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumDropZoneProps} from '../src/DropZone';
import Upload from '@spectrum-icons/illustrations/Upload';

type StoryArgs = SpectrumDropZoneProps;

const meta: Meta<StoryArgs> = {
  title: 'DropZone',
  component: DropZone
};

export default meta;

export const Default = {
  render: (args) => (
    <DropZone 
      {...args} 
      onDrop={action('onDrop')}
      onDropEnter={action('onDropEnter')}
      onDropExit={action('onDropExit')} >
      <IllustratedMessage>
        <Upload />
        <Heading>Drag and Drop your file</Heading>
        <Content>
          <FileTrigger
            onChange={action('onChange')}>
            <Link>Select a File</Link> from your computer
          </FileTrigger>
        </Content>
      </IllustratedMessage>
    </DropZone>
  )
};

