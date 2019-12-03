import {HTMLAttributes, useState} from 'react';
import {MultipleSelectionBase} from '@react-types/shared';
import {useFocusWithin} from '@react-aria/interactions';

interface AriaTagGroupProps extends MultipleSelectionBase {
  isDisabled?: boolean,
  isReadOnly?: boolean, // removes close button
  validationState?: 'valid' | 'invalid'
}

interface TagGroupAria {
  tagGroupProps: HTMLAttributes<HTMLElement>
}

export function useTagGroup(props: AriaTagGroupProps): TagGroupAria {
  const {isDisabled, validationState} = props;
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setFocusWithin
  });

  return {
    tagGroupProps: {
      role: 'grid',
      'aria-atomic': false,
      'aria-relevant': 'additions',
      'aria-live': isFocusWithin ? 'polite' : 'off',
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid',
      ...focusWithinProps
    }
  };
}
