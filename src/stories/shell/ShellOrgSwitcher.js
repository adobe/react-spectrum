import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../../.storybook/layout';

import ShellOrgSwitcher from '../../shell/ShellOrgSwitcher';
import ShellOrganization from '../../shell/ShellOrganization';
import ShellSubOrganization from '../../shell/ShellSubOrganization';

storiesOf('ShellOrgSwitcher', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({ selected: true }),
    { inline: true }
  )
  .addWithInfo(
    'open: true',
    () => render({ selected: true, open: true }),
    { inline: true }
  )
  .addWithInfo(
    'open: true, no selected',
    () => render({ open: true }),
    { inline: true }
  );

function render({ selected, ...props } = {}) {
  return (
    <ShellOrgSwitcher
      onOrgChange={ action('org-change') }
      { ...props }
    >
      <ShellOrganization name="facebook" icon="facebookColor" label="Facebook, Inc." />
      <ShellOrganization name="flickr" icon="flickrColor" label="Flickr, Inc." />
      <ShellOrganization name="newsgator" icon="newsgatorColor" label="Newsgator, Inc." />
      <ShellOrganization name="microsoft" icon="windowsColor" label="Microsoft">
        <ShellSubOrganization name="microsoftjapan" label="Microsoft Japan" selected={ selected } />
        <ShellSubOrganization name="microsoftusa" label="Microsoft USA" />
        <ShellSubOrganization name="microsoftsouthamerica" label="Microsoft South America" />
      </ShellOrganization>
    </ShellOrgSwitcher>
  );
}
