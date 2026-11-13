'use client';
import {Check} from 'lucide-react';
import React, {useContext} from 'react';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {TabListStateContext} from 'react-aria-components/Tabs';
import {
  Wizard as AriaWizard,
  WizardPanel as AriaWizardPanel,
  type WizardPanelProps,
  WizardPanels as AriaWizardPanels,
  type WizardPanelsProps,
  type WizardProps,
  WizardStep as AriaWizardStep,
  WizardStepList as AriaWizardStepList,
  type WizardStepListProps,
  type WizardStepProps
} from 'react-aria-components/Wizard';
import {tv} from 'tailwind-variants';
import {Button} from './Button';
import {composeTailwindRenderProps, focusRing} from './utils';

export function Wizard(props: WizardProps) {
  return (
    <AriaWizard
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'flex flex-col gap-4 w-100 max-w-full font-sans text-sm'
      )}
    />
  );
}

export function WizardStepList<T extends object>(props: WizardStepListProps<T>) {
  return (
    <AriaWizardStepList
      {...props}
      className={composeTailwindRenderProps(props.className, 'flex')}
    />
  );
}

const markerStyles = tv({
  extend: focusRing,
  base: 'flex items-center justify-center size-6 shrink-0 rounded-full border text-xs',
  variants: {
    isUpcoming: {
      true: 'border-neutral-400',
      false:
        'border-transparent bg-blue-600 text-white forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
    }
  }
});

export function WizardStep(props: WizardStepProps) {
  return (
    <AriaWizardStep
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        // The ::before and ::after elements draw the connector lines on either side of the marker.
        'relative box-border flex flex-1 flex-col items-center gap-2 px-1 text-center text-neutral-800 dark:text-neutral-200 cursor-default outline-0 [-webkit-tap-highlight-color:transparent] selected:font-semibold disabled:text-neutral-300 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText] before:absolute before:start-0 before:end-[calc(50%+--spacing(5))] before:top-3 before:border-t before:border-neutral-400 forced-colors:before:border-[ButtonBorder] first:before:hidden selected:before:border-blue-600 data-completed:before:border-blue-600 after:absolute after:start-[calc(50%+--spacing(5))] after:end-0 after:top-3 after:border-t after:border-neutral-400 forced-colors:after:border-[ButtonBorder] data-completed:after:border-blue-600 last:after:hidden'
      )}>
      {composeRenderProps(
        props.children,
        (children, {isSelected, isCompleted, isFocusVisible, stepNumber}) => (
          <>
            {/* The step already announces whether it is completed, so the marker is hidden. */}
            <span
              className={markerStyles({isUpcoming: !isSelected && !isCompleted, isFocusVisible})}
              aria-hidden>
              {isCompleted ? <Check className="size-3.5" /> : stepNumber}
            </span>
            {children}
          </>
        )
      )}
    </AriaWizardStep>
  );
}

export function WizardPanels<T extends object>(props: WizardPanelsProps<T>) {
  return <AriaWizardPanels {...props} />;
}

const panelStyles = tv({
  extend: focusRing,
  base: 'box-border p-4 text-sm text-neutral-900 dark:text-neutral-100'
});

export function WizardPanel(props: WizardPanelProps) {
  return (
    <AriaWizardPanel
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        panelStyles({...renderProps, className})
      )}
    />
  );
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
    <div className="flex justify-between">
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
