import {action, storiesOf} from '@storybook/react';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import React from 'react';
import {Tab, TabList} from '../src/TabList';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('TabList', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    'The page, anchored, and panel variants have been deprecated. Page is now compact, and panel/anchored tabs are just default. These variants will map properly to the new styles, but please do not specify these variants going forward.',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'defaultSelectedIndex: 1',
    () => render({defaultSelectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'selectedIndex: 1',
    () => render({selectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'selected set on Tab',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab>Tab 1</Tab>
        <Tab selected>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
    ),
    {inline: true}
  )
  .addWithInfo(
    'orientation: vertical',
    () => render({orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: compact',
    () => render({variant: 'compact'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet, variant: compact',
    () => render({quiet: true, variant: 'compact'}),
    {inline: true}
  )
  .addWithInfo(
    'icons',
    () => render({icons: true}),
    {inline: true}
  )
  .addWithInfo(
    'icons, orientation: vertical',
    () => render({icons: true, orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: compact, orientation: vertical',
    () => render({variant: 'compact', orientation: 'vertical'}),
    {inline: true}
  )
  .addWithInfo(
    'icons only',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />} title="Twitter" aria-label="Tab 1" />
        <Tab icon={<Instagram />} title="Instagram" aria-label="Tab 2" />
        <Tab icon={<Facebook />} title="Facebook" aria-label="Tab 3" />
      </TabList>
    ),
    {inline: true}
  )
  .addWithInfo(
    'disabled tabs',
    () => (
      <TabList onChange={action('onChange')}>
        <Tab icon={<Twitter />} title="Twitter">Tab 1</Tab>
        <Tab icon={<Instagram />} title="Instagram" disabled>Tab 2</Tab>
        <Tab icon={<Facebook />} title="Facebook">Tab 3</Tab>
      </TabList>
    ),
    {inline: true}
  )
  .addWithInfo(
    'keyboardActivation: manual',
    () => render({icons: true, keyboardActivation: 'manual'}),
    {inline: true}
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
