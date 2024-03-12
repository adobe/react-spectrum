import {MenuItem} from '../src/Menu'; // should MenuTrigger just come from RAC?
import {ActionMenu} from '../src/ActionMenu';

import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ActionMenu> = {
  component: ActionMenu,
  parameters: {
    layout: 'centered'
  }
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
