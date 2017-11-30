import {action, storiesOf} from '@storybook/react';
import Facebook from '../../src/Icon/Facebook';
import Flickr from '../../src/Icon/Flickr';
import Newsgator from '../../src/Icon/Newsgator';
import React from 'react';
import ShellOrgSwitcher from '../../src/Shell/js/ShellOrgSwitcher';
import {VerticalCenter} from '../../.storybook/layout';
import Windows from '../../src/Icon/Windows8';

storiesOf('ShellOrgSwitcher', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'open: true',
    () => render({open: true}),
    {inline: true}
  )
  .addWithInfo(
    'open: true, no selected',
    () => render({open: true, value: null}),
    {inline: true}
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
