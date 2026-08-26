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

import {Avatar} from '../src/Avatar';
import {AvatarGroup} from '../src/AvatarGroup';
import {Example, WithLabel, WithProviderBackground} from '../stories/AvatarGroup.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {StaticMatrix, StaticMatrixCell} from './utils';

const meta: Meta<typeof AvatarGroup> = {
  component: AvatarGroup,
  parameters: {
    chromaticProvider: {backgrounds: ['base', 'layer-1', 'layer-2'], disableAnimations: true}
  },
  title: 'S2 Chromatic/AvatarGroup'
};

export default meta;

export {Example, WithLabel, WithProviderBackground};

const avatarSource = new URL('assets/normal.png', import.meta.url).toString();

export const Sizes: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <StaticMatrix minColumnWidth={180}>
      {([16, 20, 24, 28, 32, 36, 40] as const).flatMap(size =>
        [undefined, '145 members'].map(label => (
          <StaticMatrixCell
            key={`${size}-${label ?? 'no-label'}`}
            label={`${size}${label ? ' with label' : ''}`}>
            <AvatarGroup size={size} label={label} aria-label={label ? undefined : 'Online users'}>
              <Avatar alt="Profile one" src={avatarSource} />
              <Avatar alt="Profile two" src={avatarSource} />
              <Avatar alt="Profile three" src={avatarSource} />
            </AvatarGroup>
          </StaticMatrixCell>
        ))
      )}
    </StaticMatrix>
  )
};
