import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {LabelPosition, RadioGroupProps} from '@react-types/radio';
import React, {forwardRef, RefObject, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useRadioGroup} from '@react-aria/radio';
import {useRadioGroupState} from '@react-stately/radio';

interface RadioGroupContext {
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  isEmphasized?: boolean,
  labelPosition?: LabelPosition,
  name?: string,
  validationState?: 'valid' | 'invalid',
  selectedRadio?: string,
  setSelectedRadio?: (value: string) => void
}

const RadioContext = React.createContext<RadioGroupContext | null>(null);

export function useRadioProvider(): RadioGroupContext {
  return useContext(RadioContext);
}

export const RadioGroup = forwardRef((props: RadioGroupProps, ref: RefObject<HTMLDivElement>) => {
  let completeProps = useProviderProps(props);

  let {
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled,
    labelPosition,
    validationState,
    children,
    className,
    orientation,
    ...otherProps
  } = completeProps;

  let {selectedRadio, setSelectedRadio} = useRadioGroupState(completeProps);
  let {radioGroupProps, radioProps} = useRadioGroup(completeProps);

  return (
    <div
      {...filterDOMProps(otherProps, {name: false})}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-FieldGroup',
          {
            'spectrum-FieldGroup--vertical': orientation === 'vertical'
          },
          className
        )
      }
      {...radioGroupProps}>
      <RadioContext.Provider
        value={{
          isEmphasized,
          isRequired,
          isReadOnly,
          isDisabled,
          validationState,
          name: radioProps.name,
          labelPosition,
          selectedRadio,
          setSelectedRadio
        }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
});
