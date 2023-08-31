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

import {classNames} from '@react-spectrum/utils';
import {DropZone, SpectrumDropZoneProps} from '../';
import {Flex, Grid, repeat} from '@react-spectrum/layout';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Meta} from '@storybook/react';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
import Upload from '@spectrum-icons/illustrations/Upload';

export default {
  title: 'DropZone',
  parameter: {
    chromaticProvider: {
      locales: ['en-US']
    }
  }
};

export const Test = () => (
  <DropZone data-focus-visible>
    <IllustratedMessage>
      <Upload />
      <Heading>
        Drag and drop here
      </Heading>
    </IllustratedMessage>
  </DropZone>
)