import {action, storiesOf} from '@storybook/react';
import React from 'react';
import {SideNav, SideNavHeading, SideNavItem} from '../src/SideNav';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('SideNav', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <SideNav defaultValue="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    ),
    {inline: true}
  )
  .addWithInfo(
    'manageTabIndex: true',
    () => (
      <SideNav defaultValue="test" manageTabIndex onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Controlled',
    () => (
      <SideNav value="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo">Foo</SideNavItem>
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
    'renderLink',
    () => (
      <SideNav defaultValue="foo" onSelect={action('onSelect')}>
        <SideNavItem value="foo" renderLink={(props) => <Link {...props} to="/">Foo</Link>} />
        <SideNavItem value="baz" disabled>Baz</SideNavItem>
        <SideNavItem value="test">Test</SideNavItem>
        <SideNavItem value="hi">Hi</SideNavItem>
      </SideNav>
    ),
    {inline: true}
  );

class Link extends React.Component {
  render() {
    return <a {...this.props}>Custom link component: {this.props.children}</a>;
  }
}
