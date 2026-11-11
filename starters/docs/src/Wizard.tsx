'use client';
import {
  type Key,
  useWizardStep,
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
import {TabListStateContext} from 'react-aria-components/Tabs';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Check} from 'lucide-react';
import {useContext} from 'react';
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
      {composeRenderProps(props.children, children => (
        <>
          <StepMarker id={props.id} />
          {children}
        </>
      ))}
    </RACWizardStep>
  );
}

// The step already announces its label and whether it is completed, so the marker is hidden
// from assistive technology.
function StepMarker({id}: {id?: Key}) {
  let state = useContext(TabListStateContext);
  let {isCompleted} = useWizardStep(id);
  let node = id != null ? state?.collection.getItem(id) : null;
  return (
    <span className="marker" data-completed={isCompleted || undefined} aria-hidden>
      {isCompleted ? <Check size={14} /> : (node?.index ?? 0) + 1}
    </span>
  );
}

export function WizardPanels<T extends object>(props: WizardPanelsProps<T>) {
  return <RACWizardPanels {...props} />;
}

export function WizardPanel(props: WizardPanelProps) {
  return <RACWizardPanel {...props} />;
}

// Back and Next buttons that move between steps. Render inside the <Wizard>, outside <WizardPanels>.
export function WizardButtons() {
  let state = useContext(TabListStateContext);
  if (!state || state.selectedKey == null) {
    return null;
  }

  let {collection, selectedKey, setSelectedKey} = state;
  let previousKey = collection.getKeyBefore(selectedKey);
  let nextKey = collection.getKeyAfter(selectedKey);
  return (
    <div className="wizard-buttons">
      <Button
        variant="secondary"
        isDisabled={previousKey == null}
        onPress={() => setSelectedKey(previousKey)}>
        Back
      </Button>
      <Button isDisabled={nextKey == null} onPress={() => setSelectedKey(nextKey)}>
        Next
      </Button>
    </div>
  );
}
