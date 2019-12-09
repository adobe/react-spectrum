import {AllHTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {useId} from '@react-aria/utils';


interface RadioGroupAria {
  radioGroupProps: AllHTMLAttributes<HTMLElement>,
  radioProps: AllHTMLAttributes<HTMLInputElement>
}

export function useRadioGroup(props: RadioGroupProps): RadioGroupAria {
  let defaultGroupId = `${useId()}-group`;
  let {
    name = defaultGroupId,
    isRequired
  } = props;

  return {
    radioGroupProps: {
      role: 'radiogroup',
      'aria-required': isRequired
    },
    radioProps: {
      name
    }
  };
}
