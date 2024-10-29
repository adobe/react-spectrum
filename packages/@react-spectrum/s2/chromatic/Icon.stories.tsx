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

import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';

const meta: Meta<typeof NewIcon> = {
  component: NewIcon,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Icon'
};

export default meta;

type Story = StoryObj<typeof NewIcon>;
export const Example: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 8, justifyContent: 'center'}}>
        <NewIcon {...args} />
      </div>
    );
  }
};
