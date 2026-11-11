import {
  Wizard,
  WizardButtons,
  WizardPanel,
  WizardPanels,
  WizardStep,
  WizardStepList
} from '../src/Wizard';
import {fn} from 'storybook/test';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Wizard> = {
  component: Wizard,
  parameters: {
    layout: 'centered'
  },
  args: {
    onSelectionChange: fn()
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Wizard>;

export const Example: Story = args => (
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
