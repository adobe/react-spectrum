import {action, storiesOf} from '@storybook/react';
import AdobeAnalytics from '../../src/Icon/AdobeAnalytics';
import AdobeAudienceManager from '../../src/Icon/AdobeAudienceManager';
import AdobeCampaign from '../../src/Icon/AdobeCampaign';
import AdobeExperienceManager from '../../src/Icon/AdobeExperienceManager';
import AdobeMediaOptimizer from '../../src/Icon/AdobeMediaOptimizer';
import AdobePrimetime from '../../src/Icon/AdobePrimetime';
import AdobeSocial from '../../src/Icon/AdobeSocial';
import AdobeTarget from '../../src/Icon/AdobeTarget';
import Asset from '../../src/Icon/Asset';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import CallCenter from '../../src/Icon/CallCenter';
import Facebook from '../../src/Icon/Facebook';
import Feed from '../../src/Icon/Feed';
import Flickr from '../../src/Icon/Flickr';
import Globe from '../../src/Icon/Globe';
import Launch from '../../src/Icon/Launch';
import MobileServices from '../../src/Icon/MobileServices';
import Newsgator from '../../src/Icon/Newsgator';
import React from 'react';
import Servers from '../../src/Icon/Servers';
import ShellActions from '../../src/Shell/js/ShellActions';
import ShellHeader from '../../src/Shell/js/ShellHeader';
import ShellHelp from '../../src/Shell/js/ShellHelp';
import ShellOrgSwitcher from '../../src/Shell/js/ShellOrgSwitcher';
import ShellSolution from '../../src/Shell/js/ShellSolution';
import ShellSolutionGroup from '../../src/Shell/js/ShellSolutionGroup';
import ShellSolutionSwitcher from '../../src/Shell/js/ShellSolutionSwitcher';
import ShellUserProfile from '../../src/Shell/js/ShellUserProfile';
import ShellWorkspace from '../../src/Shell/js/ShellWorkspace';
import ShellWorkspaces from '../../src/Shell/js/ShellWorkspaces';
import Sync from '../../src/Icon/Sync';
import User from '../../src/Icon/User';
import {VerticalTop} from '../../.storybook/layout';
import Windows from '../../src/Icon/Windows8';

// We need the Shell Header to be the topmost item on the page because the CoralUI Shell styles assume the menus will be
// sliding in from the top.  If we include the Storybook header, it pushes the ShellHeader down too far and makes it
// look broken while interacting with it.
const options = {inline: true, header: false};

storiesOf('ShellHeader', module)
  .addDecorator(story => <VerticalTop>{story()}</VerticalTop>)
  .addWithInfo(
    'homeIcon: AdobeExperienceManager',
    () => render({homeIcon: <AdobeExperienceManager />}),
    options
  );

function render(props = {}) {
  return (
    <ShellHeader {...props}>
      <ShellActions>
        <Button element="a" href="#" variant="quiet">Beta Feedback</Button>

        <ShellOrgSwitcher
          options={[
            {value: 'facebook', label: 'Facebook, Inc.', icon: <Facebook />},
            {value: 'flickr', label: 'Flickr, Inc.', icon: <Flickr />},
            {value: 'newsgator', label: 'Newsgator, Inc.', icon: <Newsgator />},
            {value: 'microsoft', label: 'Microsoft', icon: <Windows />},
          ]}
          onOrgChange={action('org-change')}
          value="facebook" />

        <ShellHelp
          moreSearchResultsUrl="#"
          onSearch={action('search')}
          defaultResults={[
            {href: '/learn', icon: <Globe />, label: 'Marketing Cloud Help'},
            {href: '/community', icon: <User />, label: 'Community'},
            {href: '/customercare', icon: <CallCenter />, label: 'Customer Care'},
            {href: '/status', icon: <Servers />, label: 'Adobe Marketing Cloud Status'}
          ]} />

        <Button variant="minimal" className="coral-Shell-menu-button" icon={<Bell />} square />

        <ShellSolutionSwitcher>
          <ShellSolutionGroup>
            <ShellSolution href="#" icon={<AdobeAnalytics />} label="Analytics" entitled />
            <ShellSolution href="#" icon={<AdobeExperienceManager />} label="Experience Manager" entitled />
            <ShellSolution href="#" icon={<AdobeTarget />} label="Target" entitled />
            <ShellSolution href="#" icon={<AdobeAudienceManager />} label="Audience Manager" />
            <ShellSolution href="#" icon={<AdobeCampaign />} label="Campaign" />
            <ShellSolution href="#" icon={<AdobeMediaOptimizer />} label="Media Optimizer" />
            <ShellSolution href="#" icon={<AdobePrimetime />} label="Primetime" />
            <ShellSolution href="#" icon={<AdobeSocial />} label="Social" />
          </ShellSolutionGroup>
          <ShellSolutionGroup secondary>
            <ShellSolution href="#" icon={<Launch />} label="Activation" />
            <ShellSolution href="#" icon={<Asset />} label="Assets" />
            <ShellSolution href="#" icon={<Sync />} label="Exchange" />
            <ShellSolution href="#" icon={<Feed />} label="Feed" />
            <ShellSolution href="#" icon={<MobileServices />} label="Mobile Services" />
            <ShellSolution href="#" icon={<User />} label="Profiles & Audiences" />
          </ShellSolutionGroup>
        </ShellSolutionSwitcher>

        <ShellUserProfile
          name="Shantanu Narayen"
          heading="CEO"
          subheading="Adobe Systems, Inc."
          avatarUrl="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg"
          profileUrl="#"
          onSignOut={action('sign out')} />
      </ShellActions>
      <ShellWorkspaces>
        <ShellWorkspace href="#workspace1" selected>Workspace 1</ShellWorkspace>
        <ShellWorkspace href="#workspace2">Workspace 2</ShellWorkspace>
        <ShellWorkspace href="#workspace3">Workspace 3</ShellWorkspace>
      </ShellWorkspaces>
    </ShellHeader>
  );
}
