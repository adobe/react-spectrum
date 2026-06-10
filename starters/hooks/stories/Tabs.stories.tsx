import {Item} from 'react-stately/Item';
import {Tabs} from '../src/Tabs';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Tabs>;

export const Example: Story = args => (
  <Tabs aria-label="History of Ancient Rome" {...args}>
    <Item key="FoR" title="Founding of Rome">
      Arma virumque cano, Troiae qui primus ab oris.
    </Item>
    <Item key="MaR" title="Monarchy and Republic">
      Senatus Populusque Romanus.
    </Item>
    <Item key="Emp" title="Empire">
      Alea jacta est.
    </Item>
  </Tabs>
);
