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
import {ProgressList, ProgressListItem, ProgressListItemContent} from '../src/ProgressList';
import React, {ReactNode} from 'react';
import './ProgressList.css';

const steps = [
  {id: 'domain', label: 'Domain/Sender details'},
  {id: 'dns', label: 'Configure DNS'},
  {id: 'advanced', label: 'Advanced settings'}
];

export default {
  title: 'React Aria Components/ProgressList',
  component: ProgressList,
  args: {
    selectedKey: 'dns'
  },
  argTypes: {
    selectedKey: {
      control: 'radio',
      options: steps.map(step => step.id)
    }
  }
} as Meta<typeof ProgressList>;

export type ProgressListStory = StoryObj<typeof ProgressList>;

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

export const ProgressListExample: ProgressListStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <ProgressList {...args} aria-label="Email domain setup">
        {steps.map(step => (
          <ProgressListItem key={step.id} id={step.id}>
            {({isCompleted, stepNumber}) => (
              <span className="marker" role="presentation">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span role="presentation" aria-hidden="true">
                    {stepNumber}
                  </span>
                )}
                <ProgressListItemContent>
                  <span className="label">{step.label}</span>
                </ProgressListItemContent>
              </span>
            )}
          </ProgressListItem>
        ))}
      </ProgressList>
    </div>
  )
};

export const ProgressListDynamic: ProgressListStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <ProgressList {...args} aria-label="Email domain setup" items={steps}>
        {(step: (typeof steps)[number]) => (
          <ProgressListItem>
            {({isCompleted, stepNumber}) => (
              <span className="marker" role="presentation">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span role="presentation" aria-hidden="true">
                    {stepNumber}
                  </span>
                )}
                <ProgressListItemContent>
                  <span className="label">{step.label}</span>
                </ProgressListItemContent>
              </span>
            )}
          </ProgressListItem>
        )}
      </ProgressList>
    </div>
  )
};
