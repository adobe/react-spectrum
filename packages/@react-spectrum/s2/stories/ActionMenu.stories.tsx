import {ActionMenu, MenuItem} from '../src';

import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

export const Example: Story = {
  render: (args) => {
    return (
      <ActionMenu {...args}>
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </ActionMenu>
    );
  }
};
interface IExampleItem {
  id: string,
  label: string
}
let items: IExampleItem[] = [
  {id: 'cut', label: 'Cut'},
  {id: 'copy', label: 'Copy'},
  {id: 'paste', label: 'Paste'}
];
export const DynamicExample: Story = {
  render: (args) => {
    return (
      <ActionMenu {...args}>
        {(item) => <MenuItem id={(item as IExampleItem).id}>{(item as IExampleItem).label}</MenuItem>}
      </ActionMenu>
    );
  },
  args: {
    items
  }
};

DynamicExample.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let items = [
  {id: 'cut', label: 'Cut'},
  {id: 'copy', label: 'Copy'},
  {id: 'paste', label: 'Paste'}
];

<ActionMenu items={items}>
  {(item) => <MenuItem id={item.id>{item.label}</MenuItem>}
</ActionMenu>`;
      }
    }
  }
};
