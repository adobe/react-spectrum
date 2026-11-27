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

import {Button} from '../src/Button';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Key} from '@react-types/shared';
import {Label} from '../src/Label';
import {Meta, StoryObj} from '@storybook/react';
import React, {ReactNode, useState} from 'react';
import {TextField} from '../src/TextField';
import {
  Wizard,
  WizardPanel,
  WizardPanels,
  WizardProps,
  WizardStep,
  WizardStepList
} from '../src/Wizard';
import './Wizard.css';
import './styles.css';

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
function StepMarker({
  isCompleted,
  stepNumber
}: {
  isCompleted: boolean;
  stepNumber: number;
}): ReactNode {
  return (
    <span className="marker" aria-hidden="true">
      {isCompleted ? <CheckIcon /> : stepNumber}
    </span>
  );
}

export const WizardExample: WizardStory = {
  render: (args: any) => (
    <div>
      <button>Focus landing point</button>
      <Wizard {...args} className="wizard" defaultSelectedKey="dns">
        <WizardStepList aria-label="Email domain setup">
          {steps.map(step => (
            <WizardStep key={step.id} id={step.id}>
              {({isCompleted, stepNumber}) => (
                <>
                  <StepMarker isCompleted={isCompleted} stepNumber={stepNumber} />
                  <span className="text">
                    <span className="label">{step.label}</span>
                    <span className="position">
                      Step {stepNumber} of {steps.length}
                    </span>
                  </span>
                </>
              )}
            </WizardStep>
          ))}
        </WizardStepList>
      </Wizard>
    </div>
  )
};

const formSteps = [
  {...steps[0], fieldLabel: 'Domain name (required)', name: 'domain', type: 'text' as const},
  {...steps[1], fieldLabel: 'DNS TXT record (required)', name: 'dns', type: 'text' as const},
  {...steps[2], fieldLabel: 'Reply-to email (required)', name: 'replyTo', type: 'email' as const}
];

function FormWizardExample(args: WizardProps): ReactNode {
  let [selectedKey, setSelectedKey] = useState<Key>('domain');
  let [values, setValues] = useState<Record<string, string>>({});
  let [submitted, setSubmitted] = useState(false);
  let stepIndex = formSteps.findIndex(step => step.id === selectedKey);

  return (
    <Wizard
      {...args}
      className="wizard wizard-with-forms"
      allowsRandomAccess={false}
      selectedKey={selectedKey}
      onSelectionChange={key => {
        setSelectedKey(key);
        setSubmitted(false);
      }}
      completedKeys={formSteps.slice(0, stepIndex + (submitted ? 1 : 0)).map(step => step.id)}>
      <WizardStepList aria-label="Email domain setup">
        {formSteps.map(step => (
          <WizardStep key={step.id} id={step.id}>
            {({isCompleted, stepNumber}) => (
              <>
                <StepMarker isCompleted={isCompleted} stepNumber={stepNumber} />
                <span className="text">
                  <span className="label">{step.label}</span>
                  <span className="position">
                    Step {stepNumber} of {formSteps.length}
                  </span>
                </span>
              </>
            )}
          </WizardStep>
        ))}
      </WizardStepList>
      <WizardPanels>
        {formSteps.map((step, index) => (
          <WizardPanel key={step.id} id={step.id}>
            <Form
              aria-label={step.label}
              validationBehavior="native"
              onSubmit={e => {
                e.preventDefault();
                if (index < formSteps.length - 1) {
                  setSelectedKey(formSteps[index + 1].id);
                } else {
                  setSubmitted(true);
                }
              }}>
              <h2>{step.label}</h2>
              <TextField
                name={step.name}
                type={step.type}
                isRequired
                value={values[step.name] ?? ''}
                onChange={value => {
                  setValues(previous => ({...previous, [step.name]: value}));
                  setSubmitted(false);
                }}
                validate={value => (value.trim() ? null : 'Enter a value for this field.')}>
                <Label>{step.fieldLabel}</Label>
                <Input />
                <FieldError />
              </TextField>
              <div className="wizard-buttons">
                <Button slot="previous" type="button">
                  Previous
                </Button>
                {/* Advance on valid submission, not the next slot's onPress. */}
                <Button type="submit" isDisabled={submitted}>
                  {index === formSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
              {submitted && <p role="status">Email domain setup complete.</p>}
            </Form>
          </WizardPanel>
        ))}
      </WizardPanels>
    </Wizard>
  );
}

export const WizardWithForms: WizardStory = {
  render: args => <FormWizardExample {...args} />
};
