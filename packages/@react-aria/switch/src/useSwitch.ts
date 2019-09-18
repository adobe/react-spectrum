import {SwitchProps} from '@react-types/switch';
import {ToggleAriaProps, useToggle} from '@react-aria/toggle';
import {ToggleState} from '@react-types/toggle';

export interface SwitchAriaProps {
  inputProps: ToggleAriaProps
}

export function useSwitch(props: SwitchProps, state: ToggleState):SwitchAriaProps {
  let toggleAriaProps = useToggle(props, state);
  let {checked} = state;

  return {
    inputProps: {
      ...toggleAriaProps,
      role: 'switch',
      checked,
      'aria-checked': checked
    }
  };
}
