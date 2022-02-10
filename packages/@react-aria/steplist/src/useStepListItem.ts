import {RefObject} from 'react';
// @ts-ignore
import {StepListItemAria, StepListItemProps, StepListState} from '@react-types/steplist';
import {useSelectableItem} from '@react-aria/selection';

export function useStepListItem<T>(props: StepListItemProps<T>, state: StepListState<T>, ref: RefObject<HTMLElement>): StepListItemAria {
  const {isDisabled: propsDisabled, item} = props;
  const {key} = item;

  let {selectionManager: manager, selectedKey} = state;

  let isDisabled = propsDisabled || state.disabledKeys.has(key);

  let {itemProps} = useSelectableItem({
    selectionManager: manager,
    key,
    ref,
    isDisabled
  });

  const isSelected = selectedKey === key;
  const isFocused = key === manager.focusedKey;

  let {tabIndex} = itemProps;

  return {
    stepProps: {
      ...itemProps,
      'aria-selected': isSelected,
      'aria-current': isSelected ? 'step' : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-live': isFocused ? 'assertive' : undefined,
      'aria-atomic': isFocused || undefined,
      'aria-relevant': isFocused ? 'text' : undefined,
      tabIndex: isDisabled ? undefined : tabIndex
    }
  };
}
