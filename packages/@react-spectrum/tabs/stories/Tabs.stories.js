import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tab, Tabs} from '../';

storiesOf('Tabs', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'orientation = vertical',
    () => render({orientation: 'vertical'})
  )
  // .addWithInfo(
  //   'orientation = vertical, icons',
  //   () => (
  //     <TabPanel orientation="vertical" onSelect={action('onSelect')}>
  //       <Tab icon={<Twitter />}>Tab Body 1</Tab>
  //       <Tab icon={<Facebook />}>Tab Body 2</Tab>
  //     </TabPanel>
  //   ),
  //   {inline: true}
  // )
  .add(
    'selectedItem = val2 (controlled)',
    () => render({selectedItem: 'val2'})
  )
  .add(
    'defaultSelectedItem = val2 (uncontrolled)',
    () => render({defaultSelectedItem: 'val2'})
  );

function render(props = {}) {
  return (
    <Tabs {...props} onSelectionChange={action('onSelectionChange')}>
      <Tab label="Tab 1" value="val1">Tab Body 1</Tab>
      <Tab label="Tab 2" value="val2">Tab Body 2</Tab>
    </Tabs>
  );
}
