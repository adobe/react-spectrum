import {Key, useEffect, useMemo} from 'react';
import {StepListProps} from '@react-types/steplist';
import {useControlledState} from '@react-stately/utils';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';

export interface StepListState<T> extends SingleSelectListState<T> {
  /** Last completed step in the list */
  readonly lastCompletedStep?: Key,

  /** Updates the completed step by key */
  setLastCompletedStep(key: Key): void,

  /** Checks whether step with given key is completed */
  isCompleted(key: Key): boolean
}

/**
 * Provides state management for steplist componet with functionality of single selection among
 * children Items and keeps track of completed steps.
 */
export function useStepListState<T extends object>(props: StepListProps<T>): StepListState<T> {
  const selectionState = useSingleSelectListState<T>(props);
  const { selectedKey, collection } = selectionState;
  const [lastCompletedStep, setLastCompletedStep] = useControlledState(
    props.lastCompletedStep,
    props.defaultCompletedStep,
    () => {}
  );

  const stepOrder = useMemo(() => {
    const stepOrder: Map<Key, Number> = new Map;
    let order = 1;
    for(let key of collection.getKeys()) {
      stepOrder.set(key, order++);
    }
    return stepOrder;
  }, [collection]);

  // Update lastCompletedStep when selectedKey changes
  useEffect(() => {
    // Do nothing if no selectedKey or controlled with lastCompletedStep
    if(selectedKey == null || props.lastCompletedStep !== undefined) {
      return;
    }
    // Update if lastCompletedStep is null or before selectedKey
    if(lastCompletedStep == null || stepOrder.get(selectedKey) > stepOrder.get(lastCompletedStep)) {
      setLastCompletedStep(collection.getKeyBefore(selectedKey));
    }
  }, [collection, selectedKey, props.lastCompletedStep, lastCompletedStep, stepOrder]);

  return {
    isCompleted: key => stepOrder.get(key) <= stepOrder.get(lastCompletedStep),
    lastCompletedStep,
    setLastCompletedStep,
    ...selectionState,
  }
}
