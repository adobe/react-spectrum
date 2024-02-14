import {Tag, TagGroup} from '../src/TagGroup';
import {action} from '@storybook/addon-actions';
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {Icon} from '../src/Icon';
import {Text} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TagGroup> = {
  component: TagGroup,
  parameters: {
    layout: 'centered'
  },
  args: {
    onRemove: undefined,
    selectionMode: 'single'
  },
  argTypes: {
    onRemove: {
      control: {type: 'boolean'}
    }
  }
};

export default meta;

export let Example = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }
    return (
      <TagGroup {...args}>
        <Tag>Chocolate</Tag>
        <Tag>Mint</Tag>
        <Tag>Strawberry</Tag>
        <Tag>Vanilla</Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Ice cream flavor'
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=715%3A2687'
    }
  }
};

export let Disabled = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }

    return (
      <TagGroup {...args} disabledKeys={new Set(['mint', 'vanilla'])}>
        <Tag id="chocolate" textValue="chocolate"><Icon><NewIcon /></Icon><Text>Chocolate</Text></Tag>
        <Tag id="mint">Mint</Tag>
        <Tag id="strawberry">Strawberry</Tag>
        <Tag id="vanilla">Vanilla</Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Ice cream flavor'
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=715%3A2687'
    }
  }
};

// TODO: when there is Link component, also style for light/dark?
function renderEmptyState() {
  return (
    <span>
      No categories. Put a link here to add some.
    </span>
  );
}
export let Empty = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }

    return (
      <TagGroup {...args} renderEmptyState={renderEmptyState} />
    );
  },
  args: {
    label: 'Ice cream flavor'
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=715%3A2687'
    }
  }
};
