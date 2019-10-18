import {DOMProps, MultipleSelectionBase} from '@react-types/shared';

interface AriaTagGroupProps extends MultipleSelectionBase {
  isDisabled?: boolean,
  isReadOnly?: boolean, // removes close button
  validationState?: 'valid' | 'invalid'
}

interface TagGroupAria {
  tagGroupProps: DOMProps
}

export function useTagGroup(props: AriaTagGroupProps): TagGroupAria {
  const {isDisabled, validationState} = props;
  return {
    tagGroupProps: {
      role: 'grid',
      'aria-atomic': false,
      'aria-relevant': 'additions',
      // 'aria-live': focused ? 'polite' : 'off',
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid'
    }
  };
}
