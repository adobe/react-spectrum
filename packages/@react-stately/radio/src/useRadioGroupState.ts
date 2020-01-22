import {RadioGroupProps} from '@react-types/radio';
import {useControlledState} from '@react-stately/utils';

export interface RadioGroupState {
  selectedRadio: string | undefined,
  setSelectedRadio: (value: string) => void
}

export function useRadioGroupState(props: RadioGroupProps): RadioGroupState  {
  let [selectedRadio, setSelected] = useControlledState(props.value, props.defaultValue, props.onChange);

  let setSelectedRadio = (value) => {
    if (!props.isReadOnly) {
      setSelected(value);
    }
  };

  return {selectedRadio, setSelectedRadio};
}
