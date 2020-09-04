import {Key, useEffect, useState} from 'react';
import {StepListProps} from '@react-types/steplist';
import {useControlledState} from '@react-stately/utils';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {Collection, Node} from '@react-types/shared';

export interface StepListState<T> extends SingleSelectListState<T> {
  /** Last completed step in the list */
  readonly lastCompletedStep?: Key,

  /** Updates the completed step by key */
  setLastCompletedStep(key: Key): void,

  /** Checks whether step with given key is completed */
  isCompleted(key: Key): boolean
}

/**
 * Get all keys which appears before given key in collection
 */
const getKeysBefore = (collection: Collection<Node<unknown>>, key: Key) => {
  const keys: Key[] = [];
  let currentKey = collection.getKeyBefore(key);
  while(currentKey != null) {
    keys.push(currentKey);
    currentKey = collection.getKeyBefore(currentKey);
  }
  return keys.reverse();
};

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
  const [completedSteps, setCompletedSteps] = useState([
    ...getKeysBefore(collection, props.defaultCompletedStep),
    props.defaultCompletedStep
  ]);

  // Update completedSteps when lastCompletedStep changes
  useEffect(() => {
    if (props.lastCompletedStep == null) return;
    const keys = getKeysBefore(collection, props.lastCompletedStep);
    keys.push(props.lastCompletedStep);
    setCompletedSteps(keys);
  }, [collection, props.lastCompletedStep]);

  // Update completedSteps when selectedKey changes
  useEffect(() => {
    // If no selectedKey or controlled with lastCompletedStep
    if(selectedKey == null || props.lastCompletedStep !== undefined) {
      return;
    }
    const keys = getKeysBefore(collection, selectedKey);
    if(keys.length && (lastCompletedStep == null || keys.includes(lastCompletedStep))) {
      setCompletedSteps(keys);
      setLastCompletedStep(keys[keys.length - 1]);
    }
  }, [collection, selectedKey, props.lastCompletedStep, lastCompletedStep]);

  return {
    isCompleted: key => completedSteps.includes(key),
    lastCompletedStep,
    setLastCompletedStep,
    ...selectionState,
  }
}
