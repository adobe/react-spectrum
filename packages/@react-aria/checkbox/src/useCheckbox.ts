import {CheckboxProps} from '@react-types/checkbox';
import {InputHTMLAttributes, RefObject, useEffect} from 'react';
import {ToggleState} from '@react-types/toggle';
import {useToggle} from '@react-aria/toggle';

export interface CheckboxAria {
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function useCheckbox(props: CheckboxProps, state: ToggleState, inputRef: RefObject<HTMLInputElement>): CheckboxAria {
  let {inputProps} = useToggle(props, state);
  let {isSelected} = state;

  let {isIndeterminate} = props;
  useEffect(() => {
    // indeterminate is a property, but it can only be set via javascript
    // https://css-tricks.com/indeterminate-checkboxes/
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [inputRef, isIndeterminate]);

  return {
    inputProps: {
      ...inputProps,
      checked: isSelected,
      'aria-checked': isIndeterminate ? 'mixed' : isSelected
    }
  };
}
