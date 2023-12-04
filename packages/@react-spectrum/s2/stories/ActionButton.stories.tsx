import {ActionButton} from '../src/ActionButton';
import type {Meta, StoryObj} from '@storybook/react';

import {Edit} from '../src/icons/Edit';
import {Icon} from '../src/Icon';

// determine how we want to handle this, wrappers around RAC like i have now? or just use RAC directly?
// how do we limit the API on the context? do we need to?
import {Text} from '../src/Text';

let EditIcon = () => <Icon><Edit /></Icon>;
let NoIcon = null;
let icons = {EditIcon, NoIcon}

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    icon: {
      options: Object.keys(icons), // An array of serializable values
      mapping: icons, // Maps serializable option values to complex arg values
      control: {
        type: 'select', // Type 'select' is automatically inferred when 'options' is defined
        labels: {
          // 'labels' maps option values to string labels
          NoIcon: 'No Icon',
          EditIcon: 'Edit'
        },
      },
    },
  },
  args: {
    children: 'Label'
  }
};

export default meta;

type Story = StoryObj<typeof ActionButton>;
export const Example: Story = {
  render: (args) => {
    return (
      <ActionButton {...args}>
        <EditIcon />
        {args.children.length > 0 && <Text>{args.children}</Text>}
      </ActionButton>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
// until useHasChild responds in realtime, separate stories for different child combinations

export const IconOnly: Story = {
  render: (args) => {
    return (
      <ActionButton {...args} aria-label="Edit">
        <EditIcon />
      </ActionButton>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  }
};

export const TextOnly: Story = {
  render: (args) => {
    return (
      <ActionButton {...args}>
        <Text>Label</Text>
      </ActionButton>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  }
};

export const StaticWhite: Story = {
  render: (args) => {
    return (
      <div className='h-[100%] w-[100%] flex items-center justify-center bg-gradient-to-r from-[#0f172a] to-[#334155]'>
        <ActionButton {...args}>
          <EditIcon />
          {args.children.length > 0 && <Text>{args.children}</Text>}
        </ActionButton>
      </div>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  },
  args: {
    staticColor: 'white'
  }
}

export const StaticBlack: Story = {
  render: (args) => {
    return (
      <div className='h-[100%] w-[100%] flex items-center justify-center bg-gradient-to-r from-[#ddd6fe] to-[#fbcfe8]'>
        <ActionButton {...args}>
          <EditIcon />
          {args.children.length > 0 && <Text>{args.children}</Text>}
        </ActionButton>
      </div>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  },
  args: {
    staticColor: 'black'
  }
}
