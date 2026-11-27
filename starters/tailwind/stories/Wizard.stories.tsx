import React from 'react';
import {
  Wizard,
  WizardButtons,
  WizardPanel,
  WizardPanels,
  WizardStep,
  WizardStepList
} from '../src/Wizard';
import {type Meta} from '@storybook/react';

const meta: Meta<typeof Wizard> = {
  component: Wizard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Wizard {...args}>
    <WizardStepList aria-label="Create project">
      <WizardStep id="details">Details</WizardStep>
      <WizardStep id="members">Members</WizardStep>
      <WizardStep id="review">Review</WizardStep>
    </WizardStepList>
    <WizardPanels>
      <WizardPanel id="details">Name your project and choose who can see it.</WizardPanel>
      <WizardPanel id="members">Invite people to work on the project with you.</WizardPanel>
      <WizardPanel id="review">Check the details, then create the project.</WizardPanel>
    </WizardPanels>
    <WizardButtons />
  </Wizard>
);
