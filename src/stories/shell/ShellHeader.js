import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalTop } from '../../../.storybook/layout';

import ShellHeader from '../../shell/ShellHeader';
import ShellWorkspaces from '../../shell/ShellWorkspaces';
import ShellWorkspace from '../../shell/ShellWorkspace';
import ShellActions from '../../shell/ShellActions';
import ShellHelp from '../../shell/ShellHelp';
import ShellOrgSwitcher from '../../shell/ShellOrgSwitcher';
import ShellOrganization from '../../shell/ShellOrganization';
import ShellSubOrganization from '../../shell/ShellSubOrganization';
import ShellUserProfile from '../../shell/ShellUserProfile';
import ShellSolutionSwitcher from '../../shell/ShellSolutionSwitcher';
import ShellSolutionGroup from '../../shell/ShellSolutionGroup';
import ShellSolution from '../../shell/ShellSolution';
import Button from '../../Button';

storiesOf('ShellHeader', module)
  .addDecorator(story => <VerticalTop>{ story() }</VerticalTop>)
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'homeIcon: adobeAnalyticsColor',
    () => render({ homeIcon: 'adobeAnalyticsColor' }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <ShellHeader { ...props }>
      <ShellActions>
        <Button element="a" href="#" variant="quiet">Beta Feedback</Button>

        <ShellOrgSwitcher onOrgChange={ action('org-change') }>
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
          onSearch={ action('search') }
        />

        <Button variant="minimal" className="coral-Shell-menu-button" icon="bell" square />

        <ShellSolutionSwitcher>
          <ShellSolutionGroup>
            <ShellSolution href="#" icon="adobeAnalyticsColor" label="Analytics" linked />
            <ShellSolution href="#" icon="adobeExperienceManagerColor" label="Experience Manager" linked />
            <ShellSolution href="#" icon="adobeTargetColor" label="Target" linked />
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
          onSignOut={ action('sign out') }
        />
      </ShellActions>
      <ShellWorkspaces>
        <ShellWorkspace href="#workspace1" selected>Workspace 1</ShellWorkspace>
        <ShellWorkspace href="#workspace2">Workspace 2</ShellWorkspace>
        <ShellWorkspace href="#workspace3">Workspace 3</ShellWorkspace>
      </ShellWorkspaces>
    </ShellHeader>
  );
}
