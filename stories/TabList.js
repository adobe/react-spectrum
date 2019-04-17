import {action} from '@storybook/addon-actions';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tab, TabList} from '../src/TabList';
import Twitter from '../src/Icon/Twitter';

storiesOf('TabList', module)
  .add(
    'Default',
    () => render(),
    {info: 'The page, anchored, and panel variants have been deprecated. Page is now compact, and panel/anchored tabs are just default. These variants will map properly to the new styles, but please do not specify these variants going forward.'}
  )
  .add(
    'defaultSelectedIndex: 1',
    () => render({defaultSelectedIndex: 1})
  )
  .add(
    'selectedIndex: 1',
    () => render({selectedIndex: 1})
  )
  .add(
    'selected set on Tab',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab>Tab 1</Tab>
        <Tab selected>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'variant: compact',
    () => render({variant: 'compact'})
  )
  .add(
    'quiet',
    () => render({quiet: true})
  )
  .add(
    'quiet, variant: compact',
    () => render({quiet: true, variant: 'compact'})
  )
  .add(
    'icons',
    () => render({icons: true})
  )
  .add(
    'icons, orientation: vertical',
    () => render({icons: true, orientation: 'vertical'})
  )
  .add(
    'variant: compact, orientation: vertical',
    () => render({variant: 'compact', orientation: 'vertical'})
  )
  .add(
    'icons only',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />} title="Twitter" aria-label="Tab 1" />
        <Tab icon={<Instagram />} title="Instagram" aria-label="Tab 2" />
        <Tab icon={<Facebook />} title="Facebook" aria-label="Tab 3" />
      </TabList>
    )
  )
  .add(
    'disabled tabs',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />} title="Twitter">Tab 1</Tab>
        <Tab icon={<Instagram />} title="Instagram" disabled>Tab 2</Tab>
        <Tab icon={<Facebook />} title="Facebook">Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'keyboardActivation: manual',
    () => render({icons: true, keyboardActivation: 'manual'})
  );

function render(props = {}) {
  const {icons, ...otherProps} = props;
  return (
    <TabList {...otherProps} onChange={action('onChange')}>
      <Tab icon={icons && <Twitter />} title={icons && 'Twitter'}>Tab 1</Tab>
      <Tab icon={icons && <Instagram />} title={icons && 'Instagram'}>Tab 2</Tab>
      <Tab icon={icons && <Facebook />} title={icons && 'Facebook'}>Tab 3</Tab>
    </TabList>
  );
}
