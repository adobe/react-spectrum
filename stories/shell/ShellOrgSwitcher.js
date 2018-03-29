import {action, storiesOf} from '@storybook/react';
import Facebook from '../../src/Icon/Facebook';
import Flickr from '../../src/Icon/Flickr';
import Newsgator from '../../src/Icon/Newsgator';
import React from 'react';
import ShellOrgSwitcher from '../../src/Shell/js/ShellOrgSwitcher';
import {VerticalCenter} from '../../.storybook/layout';
import Windows from '../../src/Icon/Windows8';

const options = {inline: true};
const storyTitle = 'ShellOrgSwitcher - @deprecated';
const deprecatedFlag = (<div>
  <h2 style={{'color': '#990000'}}>{ storyTitle }</h2>
  <p>ShellOrgSwitcher component has been deprecated in favor of
    <a href="http://excsdk.corp.adobe.com" target="blank"> ExC SDK </a>and its corresponding component
    <a href="http://excsdk.corp.adobe.com/#!/SuperComponents/ShellOrgSwitcher" target="blank"> ShellOrgSwitcher </a>
  </p>
</div>);

storiesOf(storyTitle, module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    deprecatedFlag,
    () => render(),
    options
  )
  .addWithInfo(
    'open: true',
    deprecatedFlag,
    () => render({open: true}),
    options
  )
  .addWithInfo(
    'open: true, no selected',
    deprecatedFlag,
    () => render({open: true, value: null}),
    options
  );

function render({value = 'facebook', ...props} = {}) {
  return (
    <ShellOrgSwitcher
      onOrgChange={action('org-change')}
      options={[
        {value: 'facebook', label: 'Facebook, Inc.', icon: <Facebook />},
        {value: 'flickr', label: 'Flickr, Inc.', icon: <Flickr />},
        {value: 'newsgator', label: 'Newsgator, Inc.', icon: <Newsgator />},
        {value: 'microsoft', label: 'Microsoft', icon: <Windows />},
      ]}
      {...props}
      value={value} />
  );
}
