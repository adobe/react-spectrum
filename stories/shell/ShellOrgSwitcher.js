import {action, storiesOf} from '@kadira/storybook';
import React from 'react';
import ShellOrgSwitcher from '../../src/Shell/js/ShellOrgSwitcher';
import {VerticalCenter} from '../../.storybook/layout';

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
        {value: 'facebook', label: 'Facebook, Inc.', icon: 'facebookColor'},
        {value: 'flickr', label: 'Flickr, Inc.', icon: 'flickrColor'},
        {value: 'newsgator', label: 'Newsgator, Inc.', icon: 'newsgatorColor'},
        {value: 'microsoft', label: 'Microsoft', icon: 'windowsColor'},
      ]}
      {...props}
      value={value} />
  );
}
