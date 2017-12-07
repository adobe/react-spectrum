import AdobeAnalytics from '../../src/Icon/AdobeAnalytics';
import AdobeAudienceManager from '../../src/Icon/AdobeAudienceManager';
import AdobeCampaign from '../../src/Icon/AdobeCampaign';
import AdobeExperienceManager from '../../src/Icon/AdobeExperienceManager';
import AdobeMediaOptimizer from '../../src/Icon/AdobeMediaOptimizer';
import AdobePrimetime from '../../src/Icon/AdobePrimetime';
import AdobeSocial from '../../src/Icon/AdobeSocial';
import AdobeTarget from '../../src/Icon/AdobeTarget';
import Asset from '../../src/Icon/Asset';
import Feed from '../../src/Icon/Feed';
import Launch from '../../src/Icon/Launch';
import MobileServices from '../../src/Icon/MobileServices';
import React from 'react';
import ShellSolution from '../../src/Shell/js/ShellSolution';
import ShellSolutionGroup from '../../src/Shell/js/ShellSolutionGroup';
import ShellSolutionSwitcher from '../../src/Shell/js/ShellSolutionSwitcher';
import {storiesOf} from '@storybook/react';
import Sync from '../../src/Icon/Sync';
import User from '../../src/Icon/User';
import {VerticalCenter} from '../../.storybook/layout';

storiesOf('ShellSolutionSwitcher', module)
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
  );

function render(props) {
  return (
    <ShellSolutionSwitcher
      {...props}>
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
  );
}
