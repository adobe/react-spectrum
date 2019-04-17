import {action} from '@storybook/addon-actions';
import React from 'react';
import {SideNav, SideNavHeading, SideNavItem} from '../src/SideNav';
import {storiesOf} from '@storybook/react';

storiesOf('SideNav', module)
  .add(
    'Default',
    () => (
      <SideNav defaultValue="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    )
  )
  .add(
    'manageTabIndex: true',
    () => (
      <SideNav defaultValue="test" manageTabIndex onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    )
  )
  .add(
    'Controlled',
    () => (
      <SideNav value="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    )
  )
  .add(
    'MultiLevel',
    () => (
      <SideNav variant="multiLevel" defaultValue="2.3.1" onSelect={action('onSelect')}>
        <SideNavItem value="foo" label="foo" />
        <SideNavItem value="baz" label="baz">
          <SideNavItem value="2.1" label="2.1" />
          <SideNavItem value="2.2" label="2.2" />
          <SideNavItem value="2.3" label="2.3">
            <SideNavItem value="2.3.1" label="2.3.1" />
            <SideNavItem value="2.3.2" label="2.3.2" />
          </SideNavItem>
        </SideNavItem>
        <SideNavItem value="test" label="test" />
        <SideNavItem value="hi" label="hi" />
      </SideNav>
    )
  )
  .add(
    'Header',
    () => (
      <SideNav defaultValue="apps" onSelect={action('onSelect')}>
        <SideNavItem value="home">Home</SideNavItem>
        <SideNavItem value="apps">Apps</SideNavItem>
        <SideNavHeading label="STORAGE">
          <SideNavItem value="dc" href="#dc">Document Cloud</SideNavItem>
          <SideNavItem value="cc" href="#cc">Creative Cloud</SideNavItem>
        </SideNavHeading>
        <SideNavHeading label="SHARED">
          <SideNavItem value="send">Send &amp; Track</SideNavItem>
          <SideNavItem value="reviews">Reviews</SideNavItem>
          <SideNavItem value="signatures">Signatures</SideNavItem>
        </SideNavHeading>
      </SideNav>
    )
  )
  .add(
    'renderLink',
    () => (
      <SideNav defaultValue="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo" renderLink={(props) => <Link {...props} to="/">Foo</Link>} />
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    )
  );

class Link extends React.Component {
  render() {
    return <a {...this.props}>Custom link component: {this.props.children}</a>;
  }
}
