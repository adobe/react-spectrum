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

const stepStyles = tv({
  base: [
    // The marker sits between two connector lines, with the label below.
    'grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-neutral-800 dark:text-neutral-200 cursor-default outline-0 [-webkit-tap-highlight-color:transparent] selected:font-semibold disabled:text-neutral-300 dark:disabled:text-neutral-600 forced-colors:disabled:text-[GrayText]',
    // Each step draws its half of the line to each neighbor, so the lines connect the markers even when steps have different widths.
    'before:col-start-1 before:row-start-1 before:border-t before:border-neutral-400 forced-colors:before:border-[ButtonBorder] first:before:hidden',
    'after:col-start-3 after:row-start-1 after:border-t after:border-neutral-400 forced-colors:after:border-[ButtonBorder] last:after:hidden',
    // Highlight the line between two steps that are both selected or completed.
    '[:is([data-selected],[data-completed])+&:is([data-selected],[data-completed])]:before:border-blue-600 forced-colors:[:is([data-selected],[data-completed])+&:is([data-selected],[data-completed])]:before:border-[Highlight]',
    '[&:is([data-selected],[data-completed]):has(+:is([data-selected],[data-completed]))]:after:border-blue-600 forced-colors:[&:is([data-selected],[data-completed]):has(+:is([data-selected],[data-completed]))]:after:border-[Highlight]'
  ].join(' ')
});

const markerStyles = tv({
  extend: focusRing,
  base: 'col-start-2 row-start-1 flex items-center justify-center size-6 box-border rounded-full border text-xs',
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
      className={composeTailwindRenderProps(props.className, stepStyles())}>
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
            <span className="col-span-full row-start-2 px-1">{children}</span>
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
