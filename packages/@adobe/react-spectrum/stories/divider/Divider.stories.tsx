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

import {ActionButton} from '../../src/button/ActionButton';
import {Divider} from '../../src/divider/Divider';
import {Meta, StoryObj} from '@storybook/react';
import Properties from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Select from '@spectrum-icons/workflow/Select';

export default {
  title: 'Divider',
  providerSwitcher: {status: 'positive'}
} as Meta<typeof Divider>;

export type DividerStory = StoryObj<typeof Divider>;

export const LargeDefault: DividerStory = {
  render: () => (
    <section>
      <h1>Large</h1>
      <Divider />
      <p>Page or Section Titles.</p>
    </section>
  ),
  name: 'Large (Default)'
};

export const Medium: DividerStory = {
  render: () => (
    <section>
      <h1>Medium</h1>
      <Divider size="M" />
      <p>
        Divide subsections, or divide different groups of elements (between panels, rails, etc.)
      </p>
    </section>
  )
};

export const Small: DividerStory = {
  render: () => (
    <section>
      <h1>Small</h1>
      <Divider size="S" />
      <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
    </section>
  )
};

export const VerticalLargeDefault: DividerStory = {
  render: () => renderVertical(),
  name: 'Vertical, Large (Default)'
};

export const VerticalMedium: DividerStory = {
  render: () => renderVertical({size: 'M'}),
  name: 'Vertical, Medium'
};

export const VerticalSmall: DividerStory = {
  render: () => renderVertical({size: 'S'}),
  name: 'Vertical, Small'
};

function renderVertical(props = {}) {
  return (
    <section style={{display: 'flex'}}>
      <ActionButton aria-label="Properties" isQuiet>
        <Properties />
      </ActionButton>
      <Divider orientation="vertical" {...props} />
      <ActionButton aria-label="Select" isQuiet>
        <Select />
      </ActionButton>
    </section>
  );
}
