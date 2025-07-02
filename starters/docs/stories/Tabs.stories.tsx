import {Tabs} from '../src/Tabs';
import {Tab, TabList, TabPanel} from 'react-aria-components';

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

export const Example: Story = (args) => (
  <Tabs {...args}>
    <TabList aria-label="History of Ancient Rome">
      <Tab id="FoR">Founding of Rome</Tab>
      <Tab id="MaR">Monarchy and Republic</Tab>
      <Tab id="Emp">Empire</Tab>
    </TabList>
    <TabPanel id="FoR">
      Arma virumque cano, Troiae qui primus ab oris.
    </TabPanel>
    <TabPanel id="MaR">
      Senatus Populusque Romanus.
    </TabPanel>
    <TabPanel id="Emp">
      Alea jacta est.
    </TabPanel>
  </Tabs>
);
