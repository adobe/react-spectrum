/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import Copy from '@spectrum-icons/workflow/Copy';
import {Divider} from '../';
import Edit from '@spectrum-icons/workflow/Edit';
import Properties from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Select from '@spectrum-icons/workflow/Select';

export default {
  title: 'Divider'
};

export const Horizontal = () => (
  <section>
    <h1>Large</h1>
    <Divider />
    <p>Page or Section Titles.</p>
    <Divider size="M" />
    <p>Divide subsections or groups of elements.</p>
    <Divider size="S" />
    <p>Divide like-elements.</p>
  </section>
);

export const Vertical = () => (
  <section style={{display: 'flex'}}>
    <ActionButton aria-label="Properties" isQuiet>
      <Properties />
    </ActionButton>
    <Divider orientation="vertical" />
    <ActionButton aria-label="Select" isQuiet>
      <Select />
    </ActionButton>
    <Divider orientation="vertical" size="M" />
    <ActionButton aria-label="Edit" isQuiet>
      <Edit />
    </ActionButton>
    <Divider orientation="vertical" size="S" />
    <ActionButton aria-label="Copy" isQuiet>
      <Copy />
    </ActionButton>
  </section>
);
