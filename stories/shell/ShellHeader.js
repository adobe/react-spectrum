import {action, storiesOf} from '@kadira/storybook';
import Button from '../../src/Button';
import React from 'react';
import ShellActions from '../../src/Shell/js/ShellActions';
import ShellHeader from '../../src/Shell/js/ShellHeader';
import ShellHelp from '../../src/Shell/js/ShellHelp';
import ShellOrganization from '../../src/Shell/js/ShellOrganization';
import ShellOrgSwitcher from '../../src/Shell/js/ShellOrgSwitcher';
import ShellSolution from '../../src/Shell/js/ShellSolution';
import ShellSolutionGroup from '../../src/Shell/js/ShellSolutionGroup';
import ShellSolutionSwitcher from '../../src/Shell/js/ShellSolutionSwitcher';
import ShellSubOrganization from '../../src/Shell/js/ShellSubOrganization';
import ShellUserProfile from '../../src/Shell/js/ShellUserProfile';
import ShellWorkspace from '../../src/Shell/js/ShellWorkspace';
import ShellWorkspaces from '../../src/Shell/js/ShellWorkspaces';
import {VerticalTop} from '../../.storybook/layout';

// We need the Shell Header to be the topmost item on the page because the CoralUI Shell styles assume the menus will be
// sliding in from the top.  If we include the Storybook header, it pushes the ShellHeader down too far and makes it
// look broken while interacting with it.
const options = {inline: true, header: false};

storiesOf('ShellHeader', module)
  .addDecorator(story => <VerticalTop>{story()}</VerticalTop>)
  .addWithInfo(
    'Default',
    () => render(),
    options
  )
  .addWithInfo(
    'homeIcon: adobeAnalyticsColor',
    () => render({homeIcon: 'adobeAnalyticsColor'}),
    options
  );

function render(props = {}) {
  return (
    <ShellHeader {...props}>
      <ShellActions>
        <Button element="a" href="#" variant="quiet">Beta Feedback</Button>

        <ShellOrgSwitcher onOrgChange={action('org-change')}>
          <ShellOrganization name="facebook" icon="facebookColor" label="Facebook, Inc." />
          <ShellOrganization name="flickr" icon="flickrColor" label="Flickr, Inc." />
          <ShellOrganization name="newsgator" icon="newsgatorColor" label="Newsgator, Inc." />
          <ShellOrganization name="microsoft" icon="windowsColor" label="Microsoft">
            <ShellSubOrganization name="microsoftjapan" label="Microsoft Japan" selected />
            <ShellSubOrganization name="microsoftusa" label="Microsoft USA" />
            <ShellSubOrganization name="microsoftsouthamerica" label="Microsoft South America" />
          </ShellOrganization>
        </ShellOrgSwitcher>

        <ShellHelp
          moreSearchResultsUrl="#"
          onSearch={action('search')} />

        <Button variant="minimal" className="coral-Shell-menu-button" icon="bell" square />

        <ShellSolutionSwitcher>
          <ShellSolutionGroup>
            <ShellSolution href="#" icon="adobeAnalyticsColor" label="Analytics" entitled />
            <ShellSolution href="#" icon="adobeExperienceManagerColor" label="Experience Manager" entitled />
            <ShellSolution href="#" icon="adobeTargetColor" label="Target" entitled />
            <ShellSolution href="#" icon="adobeAudienceManager" label="Audience Manager" />
            <ShellSolution href="#" icon="adobeCampaign" label="Campaign" />
            <ShellSolution href="#" icon="adobeMediaOptimizer" label="Media Optimizer" />
            <ShellSolution href="#" icon="adobePrimetime" label="Primetime" />
            <ShellSolution href="#" icon="adobeSocial" label="Social" />
          </ShellSolutionGroup>
          <ShellSolutionGroup secondary>
            <ShellSolution href="#" icon="launch" label="Activation" />
            <ShellSolution href="#" icon="asset" label="Assets" />
            <ShellSolution href="#" icon="sync" label="Exchange" />
            <ShellSolution href="#" icon="feed" label="Feed" />
            <ShellSolution href="#" icon="mobileServices" label="Mobile Services" />
            <ShellSolution href="#" icon="user" label="Profiles & Audiences" />
          </ShellSolutionGroup>
        </ShellSolutionSwitcher>

        <ShellUserProfile
          name="Shantanu Narayen"
          heading="CEO"
          subheading="Adobe Systems, Inc."
          avatarUrl="http://wwwimages.adobe.com/content/dam/Adobe/en/leaders/images/138x138/adobe-leaders-shantanu-narayen-138x138.jpg"
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
