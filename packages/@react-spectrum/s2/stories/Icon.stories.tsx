import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../src/wf-icons/New';

const meta: Meta<typeof NewIcon> = {
  component: NewIcon,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
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
