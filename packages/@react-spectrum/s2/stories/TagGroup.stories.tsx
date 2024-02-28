import {Tag, TagGroup} from '../src/TagGroup';
import {action} from '@storybook/addon-actions';
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {Icon} from '../src/Icon';
import {Text} from 'react-aria-components';
import {Link} from '../src/Link';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TagGroup> = {
  component: TagGroup,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=715%3A2687'
    }
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
  }
};

// TODO: Style for light/dark?
function renderEmptyState() {
  return (
    <span>
      No categories. <Link><a href="//react-spectrum.com">Click here</a></Link> to add some.
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
  }
};

export let Links = {
  render: (args: any) => {
    return (
      <TagGroup {...args} disabledKeys={new Set(['google'])}>
        <Tag id="adobe" href="https://adobe.com">Adobe</Tag>
        <Tag id="google">Google</Tag>
        <Tag id="apple" href="https://apple.com">Apple</Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Tags as links',
    selectionMode: 'none'
  }
};
