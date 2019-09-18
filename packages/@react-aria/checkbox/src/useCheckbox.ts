import {CheckboxProps} from '@react-types/checkbox';
import {MutableRefObject, useEffect} from 'react';
import {ToggleAriaProps, useToggle} from '@react-aria/toggle';
import {ToggleState} from '@react-types/toggle';

interface CheckboxInputAriaProps extends ToggleAriaProps {
  'aria-checked': boolean | 'mixed'
}

export interface CheckboxAriaProps {
  inputProps: CheckboxInputAriaProps
}

export function useCheckbox(props: CheckboxProps, state: ToggleState, inputRef: MutableRefObject<HTMLInputElement>):CheckboxAriaProps {
  let toggleAriaProps = useToggle(props, state);
  let {checked} = state;

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
      ...toggleAriaProps,
      checked,
      'aria-checked': isIndeterminate ? 'mixed' : checked
    }
  };
}
