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
import {StatusLight, StatusLightProps} from '../src/StatusLight';
import {style} from '../style' with {type: 'macro'};

const variants: NonNullable<StatusLightProps['variant']>[] = [
  'accent',
  'informative',
  'neutral',
  'positive',
  'notice',
  'negative',
  'gray',
  'red',
  'orange',
  'yellow',
  'chartreuse',
  'celery',
  'green',
  'seafoam',
  'cyan',
  'blue',
  'indigo',
  'purple',
  'fuchsia',
  'magenta',
  'pink',
  'turquoise',
  'brown',
  'cinnamon',
  'silver'
];

const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'start'
});

const meta: Meta<typeof StatusLight> = {
  component: StatusLight,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {table: {disable: true}}
  },
  tags: ['autodocs'],
  title: 'StatusLight'
};

export default meta;
type Story = StoryObj<typeof StatusLight>;

export const Example: Story = {
  render: args => <StatusLight {...args}>Status</StatusLight>,
  args: {
    variant: 'positive'
  }
};

export const LongLabel: Story = {
  render: args => (
    <StatusLight {...args} styles={style({maxWidth: 128})}>
      StatusLight with very long label so we can see wrapping
    </StatusLight>
  ),
  args: {
    variant: 'positive'
  }
};

export const AllVariants: Story = {
  render: () => (
    <div className={column()}>
      {variants.map(variant => (
        <StatusLight key={variant} variant={variant}>
          {variant}
        </StatusLight>
      ))}
    </div>
  )
};
