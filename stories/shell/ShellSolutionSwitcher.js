import React from 'react';
import ShellSolution from '../../src/Shell/js/ShellSolution';
import ShellSolutionGroup from '../../src/Shell/js/ShellSolutionGroup';
import ShellSolutionSwitcher from '../../src/Shell/js/ShellSolutionSwitcher';
import {storiesOf} from '@storybook/react';
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
  );
}
