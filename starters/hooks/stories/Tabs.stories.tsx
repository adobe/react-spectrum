import {Tab, Tabs} from '../src/Tabs';
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
    <Tab id="FoR" title="Founding of Rome">
      Arma virumque cano, Troiae qui primus ab oris.
    </Tab>
    <Tab id="MaR" title="Monarchy and Republic">
      Senatus Populusque Romanus.
    </Tab>
    <Tab id="Emp" title="Empire">
      Alea jacta est.
    </Tab>
  </Tabs>
);
