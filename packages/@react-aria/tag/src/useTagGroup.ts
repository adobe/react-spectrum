import {HTMLAttributes, useRef} from 'react';
import {MultipleSelectionBase} from '@react-types/shared';

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

  let isFocused = useRef(false);

  return {
    tagGroupProps: {
      role: 'grid',
      'aria-atomic': false,
      'aria-relevant': 'additions',
      'aria-live': isFocused.current ? 'polite' : 'off',
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid'
    }
  };
}
