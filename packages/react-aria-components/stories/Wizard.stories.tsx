/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Meta, StoryObj} from '@storybook/react';
import React, {ReactNode} from 'react';
import {useWizardStep, Wizard, WizardStep, WizardStepList} from '../src/Wizard';
import './Wizard.css';

const steps = [
  {id: 'domain', label: 'Domain/Sender details'},
  {id: 'dns', label: 'Configure DNS'},
  {id: 'advanced', label: 'Advanced settings'}
];

export default {
  title: 'React Aria Components/Wizard',
  component: Wizard,
  args: {
    allowsRandomAccess: false
  }
} as Meta<typeof Wizard>;

export type WizardStory = StoryObj<typeof Wizard>;

function CheckIcon(): ReactNode {
  return (
    <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M1 5.5 3.5 8 9 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The number and check mark repeat the label and the state that `WizardStep` already announces,
// so they are decorative.
function StepMarker({stepId, index}: {stepId: string; index: number}): ReactNode {
  let {isCompleted} = useWizardStep(stepId);
  return (
    <span className="marker" aria-hidden="true">
      {isCompleted ? <CheckIcon /> : index + 1}
    </span>
  );
}

export const WizardExample: WizardStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <Wizard
        {...args}
        className="wizard"
        defaultSelectedKey="dns"
        defaultLastCompletedStep="domain">
        <WizardStepList aria-label="Email domain setup">
          {steps.map((step, index) => (
            <WizardStep key={step.id} id={step.id}>
              <StepMarker stepId={step.id} index={index} />
              <span className="text">
                <span className="label">{step.label}</span>
                <span className="position">
                  Step {index + 1} of {steps.length}
                </span>
              </span>
            </WizardStep>
          ))}
        </WizardStepList>
      </Wizard>
    </div>
  )
};
