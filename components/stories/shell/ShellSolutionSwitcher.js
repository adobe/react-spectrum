import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../../.storybook/layout';

import ShellSolutionSwitcher from '../../shell/ShellSolutionSwitcher';
import ShellSolutionGroup from '../../shell/ShellSolutionGroup';
import ShellSolution from '../../shell/ShellSolution';

storiesOf('ShellSolutionSwitcher', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('open: true', () => render({ open: true }))

function render({ selected, ...props } = {}) {
  return (
    <ShellSolutionSwitcher
      { ...props }
    >
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
  );
}
