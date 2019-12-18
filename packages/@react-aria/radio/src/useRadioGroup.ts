import {HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';

interface RadioGroupAria {
  radioGroupProps: HTMLAttributes<HTMLElement>,
  labelProps: LabelHTMLAttributes<HTMLElement>,
  radioProps: InputHTMLAttributes<HTMLInputElement>
}

export function useRadioGroup(props: RadioGroupProps): RadioGroupAria {
  let defaultGroupId = `${useId()}-group`;
  let {
    name = defaultGroupId
  } = props;
  let {labelProps, fieldProps} = useLabel(props);

  return {
    radioGroupProps: {
      role: 'radiogroup',
      ...fieldProps
    },
    labelProps,
    radioProps: {
      name
    }
  };
}
