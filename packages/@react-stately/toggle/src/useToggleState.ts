import {CheckboxBase} from '@react-types/checkbox';
import {ToggleState} from '@react-types/toggle';
import {useControlledState} from '@react-stately/utils';

export function useToggleState(props: CheckboxBase): ToggleState {
  let {isReadOnly, onChange} = props;

  // have to provide an empty function so useControlledState doesn't throw a fit
  // can't use useControlledState's prop calling because we need the event object from the change
  let [isSelected, setSelected] = useControlledState(props.isSelected, props.defaultSelected || false, () => {});

  function updateSelected(value) {
    setSelected(value);
    if (onChange && !isReadOnly) {
      onChange(value);
    }
  }

  return {
    isSelected,
    setSelected: updateSelected
  };
}
