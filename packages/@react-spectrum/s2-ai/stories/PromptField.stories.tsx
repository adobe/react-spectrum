import type {Meta} from '@storybook/react';
import {PromptField} from '../src/PromptField';

const meta: Meta<typeof PromptField> = {
  component: PromptField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'S2-AI/PromptField',
  decorators: [
    Story => (
      <div style={{width: '800px'}}>
        <Story />
      </div>
    )
  ]
};

export default meta;

export const Default = () => <PromptField />;
