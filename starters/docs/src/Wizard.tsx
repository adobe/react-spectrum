'use client';
import {
  Wizard as RACWizard,
  WizardPanel as RACWizardPanel,
  type WizardPanelProps,
  WizardPanels as RACWizardPanels,
  type WizardPanelsProps,
  type WizardProps,
  WizardStep as RACWizardStep,
  WizardStepList as RACWizardStepList,
  type WizardStepListProps,
  type WizardStepProps
} from 'react-aria-components/Wizard';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Check} from 'lucide-react';
import {Button} from './Button';
import './Wizard.css';

export function Wizard(props: WizardProps) {
  return <RACWizard {...props} />;
}

export function WizardStepList<T extends object>(props: WizardStepListProps<T>) {
  return <RACWizardStepList {...props} />;
}

export function WizardStep(props: WizardStepProps) {
  return (
    <RACWizardStep {...props}>
      {composeRenderProps(props.children, (children, {isCompleted, stepNumber}) => (
        <>
          {/* The step already announces whether it is completed, so the marker is hidden. */}
          <span className="marker" aria-hidden>
            {isCompleted ? <Check size={14} /> : stepNumber}
          </span>
          <span className="label">{children}</span>
        </>
      ))}
    </RACWizardStep>
  );
}

export function WizardPanels<T extends object>(props: WizardPanelsProps<T>) {
  return <RACWizardPanels {...props} />;
}

export function WizardPanel(props: WizardPanelProps) {
  return <RACWizardPanel {...props} />;
}

// Back and Next buttons that move between steps, skipping disabled steps. They can render anywhere
// inside the <Wizard>, and are disabled when there is no previous or next step.
export function WizardButtons() {
  return (
    <div className="wizard-buttons">
      <Button slot="previous" variant="secondary">
        Back
      </Button>
      <Button slot="next">Next</Button>
    </div>
  );
}
