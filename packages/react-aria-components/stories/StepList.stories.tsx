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
import {StepList, StepListItem, StepListItemContent} from '../src/StepList';
import './StepList.css';

const steps = [
  {id: 'domain', label: 'Domain/Sender details', href: '#domain'},
  {id: 'dns', label: 'Configure DNS', href: '#dns'},
  {id: 'advanced', label: 'Advanced settings', href: '#advanced'}
];

export default {
  title: 'React Aria Components/StepList',
  component: StepList,
  args: {
    selectedKey: 'dns'
  },
  argTypes: {
    selectedKey: {
      control: 'radio',
      options: steps.map(step => step.id)
    }
  }
} as Meta<typeof StepList>;

export type StepListStory = StoryObj<typeof StepList>;

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

export const StepListExample: StepListStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <StepList {...args} aria-label="Email domain setup">
        {steps.map(step => (
          <StepListItem key={step.id} id={step.id}>
            {({isCompleted, stepNumber}) => (
              <span className="marker" role="presentation">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span role="presentation" aria-hidden="true">
                    {stepNumber}
                  </span>
                )}
                <StepListItemContent>
                  <span className="label">{step.label}</span>
                </StepListItemContent>
              </span>
            )}
          </StepListItem>
        ))}
      </StepList>
    </div>
  )
};

export const StepListDynamic: StepListStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <StepList {...args} aria-label="Email domain setup" items={steps}>
        {(step: (typeof steps)[number]) => (
          <StepListItem>
            {({isCompleted, stepNumber}) => (
              <span className="marker" role="presentation">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span role="presentation" aria-hidden="true">
                    {stepNumber}
                  </span>
                )}
                <StepListItemContent>
                  <span className="label">{step.label}</span>
                </StepListItemContent>
              </span>
            )}
          </StepListItem>
        )}
      </StepList>
    </div>
  )
};

export const StepListLinks: StepListStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <StepList {...args} aria-label="Email domain setup" items={steps}>
        {(step: (typeof steps)[number]) => (
          <StepListItem>
            {({isCompleted, stepNumber}) => (
              <span className="marker" role="presentation">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span role="presentation" aria-hidden="true">
                    {stepNumber}
                  </span>
                )}
                {/* Every step has an href, but only completed steps can be navigated back to. */}
                <StepListItemContent href={isCompleted ? step.href : undefined}>
                  <span className="label">{step.label}</span>
                </StepListItemContent>
              </span>
            )}
          </StepListItem>
        )}
      </StepList>
    </div>
  )
};
