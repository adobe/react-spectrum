
import type {Meta, StoryObj} from '@storybook/react';

import { ActionGroup } from '../src/ActionGroup';
// how do we want to handle this crossover?
import {Item} from '@adobe/react-spectrum';

const meta: Meta<typeof ActionGroup> = {
  component: ActionGroup,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    
  },
  args: {
    
  }
};

export default meta;

type Story = StoryObj<typeof ActionGroup>;
export const Example: Story = {
  render: (args) => {
    return (
      <ActionGroup {...args}>
        <Item>
          Copy
        </Item>
        <Item>
          Paste
        </Item>
        <Item>
          Cut
        </Item>
      </ActionGroup>
    );
  }
};
