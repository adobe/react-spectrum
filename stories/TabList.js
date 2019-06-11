import {action} from '@storybook/addon-actions';
import Button from '../src/Button';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tab, TabList} from '../src/TabList';
import Twitter from '../src/Icon/Twitter';

storiesOf('TabList', module)
  .add(
    'Default',
    () => render({'aria-label': 'Default'}),
    {info: 'The page, anchored, and panel variants have been deprecated. Page is now compact, and panel/anchored tabs are just default. These variants will map properly to the new styles, but please do not specify these variants going forward.'}
  )
  .add(
    'collapsible',
    () => renderFlexed({collapsible: true, 'aria-label': 'collapsible'}),
    {info: 'DynamicTabList is not a real component, please look at the source code for the story instead on github'}
  )
  .add(
    'defaultSelectedIndex: 1',
    () => render({defaultSelectedIndex: 1, 'aria-label': 'defaultSelectedIndex: 1'})
  )
  .add(
    'selectedIndex: 1',
    () => render({selectedIndex: 1, 'aria-label': 'selectedIndex: 1'})
  )
  .add(
    'selected set on Tab',
    () => (
      <TabList onChange={action('onChange')} aria-label="selected set on Tab">
        <Tab>Tab 1</Tab>
        <Tab selected>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'selected set on Tab with autoFocus',
    () => (
      <TabList autoFocus onChange={action('onChange')}>
        <Tab>Tab 1</Tab>
        <Tab selected>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'selected set on Tab with autoFocus',
    () => (
      <TabList autoFocus onChange={action('onChange')}>
        <Tab>Tab 1</Tab>
        <Tab selected>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical', 'aria-label': 'orientation: vertical'})
  )
  .add(
    'variant: compact',
    () => render({variant: 'compact', 'aria-label': 'variant: compact'})
  )
  .add(
    'quiet',
    () => render({quiet: true, 'aria-label': 'quiet'})
  )
  .add(
    'quiet collapsible',
    () => renderFlexed({quiet: true, collapsible: true, 'aria-label': 'quiet collapsible'}),
    {info: 'DynamicTabList is not a real component, please look at the source code for the story instead on github'}
  )
  .add(
    'quiet, variant: compact',
    () => render({quiet: true, variant: 'compact', 'aria-label': 'quiet, variant: compact'})
  )
  .add(
    'icons',
    () => render({icons: true, 'aria-label': 'icons'})
  )
  .add(
    'icons, orientation: vertical',
    () => render({icons: true, orientation: 'vertical', 'aria-label': 'icons, orientation: vertical'})
  )
  .add(
    'variant: compact, orientation: vertical',
    () => render({variant: 'compact', orientation: 'vertical', 'aria-label': 'variant: compact, orientation: vertical'})
  )
  .add(
    'icons only',
    () => (
      <TabList onChange={action('onChange')} aria-label="icons only">
        <Tab icon={<Twitter />} title="Twitter" aria-label="Tab 1" />
        <Tab icon={<Instagram />} title="Instagram" aria-label="Tab 2" />
        <Tab icon={<Facebook />} title="Facebook" aria-label="Tab 3" />
      </TabList>
    )
  )
  .add(
    'disabled tabs',
    () => (
      <TabList onChange={action('onChange')} aria-label="disabled tabs">
        <Tab icon={<Twitter />} title="Twitter">Tab 1</Tab>
        <Tab icon={<Instagram />} title="Instagram" disabled>Tab 2</Tab>
        <Tab icon={<Facebook />} title="Facebook">Tab 3</Tab>
      </TabList>
    )
  )
  .add(
    'keyboardActivation: manual',
    () => render({icons: true, keyboardActivation: 'manual', 'aria-label': 'keyboardActivation: manual'})
  );

function render(props = {}) {
  const {icons, ...otherProps} = props;
  return (
    <TabList {...otherProps} onChange={action('onChange')}>
      <Tab icon={icons && <Twitter />} title={icons && 'Twitter'}>Tab 1</Tab>
      <Tab icon={icons && <Instagram />} title={icons && 'Instagram'}>Tab 2</Tab>
      <Tab icon={icons && <Facebook />} title={icons && 'Facebook'}>Tab 3</Tab>

      <Tab icon={icons && <Twitter />} title={icons && 'Twitter'}>Tab 4</Tab>
      <Tab icon={icons && <Instagram />} title={icons && 'Instagram'}>Another Tab 5</Tab>
      <Tab icon={icons && <Facebook />} title={icons && 'Facebook'}>Some Other Tab 6</Tab>
      <Tab icon={icons && <Twitter />} title={icons && 'Twitter'}>And More 7</Tab>
      <Tab icon={icons && <Instagram />} title={icons && 'Instagram'}>Even More 8</Tab>
      <Tab icon={icons && <Facebook />} title={icons && 'Facebook'}>Different Tab 9</Tab>
    </TabList>
  );
}

class DynamicTablist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        'First Tab',
        'Second Tab',
        'Tab 3',
        'Tab 4',
        'Tab 5',
        'Tab 6',
        'Tab 7',
        'Tab 8',
        'Last Tab, 9'
      ]
    };
    this.addTab = this.addTab.bind(this);
    this.removeTab = this.removeTab.bind(this);
  }

  addTab() {
    let newTabs = this.state.tabs;
    newTabs.push('New Tab ' + (newTabs.length + 1));
    this.setState({tabs: newTabs});
  }
  removeTab() {
    if (this.state.tabs.length > 1) {
      let newTabs = this.state.tabs.slice(0, -1);
      this.setState({tabs: newTabs});
    }
  }

  render() {
    const {...otherProps} = this.props;
    const {tabs} = this.state;

    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <TabList {...otherProps} onChange={action('onChange')}>
          {tabs.map((tabname, i) => <Tab key={i}>{tabname}</Tab>)}
        </TabList>
        <Button onClick={this.removeTab} variant="action" aria-label="remove tab">-</Button>
        <Button onClick={this.addTab} variant="action" aria-label="add tab">+</Button>
      </div>

    );
  }
}

function renderFlexed(props = {}) {
  const {collapsible, ...otherProps} = props;
  return (
    <DynamicTablist collapsible={collapsible} {...otherProps} />
  );
}
