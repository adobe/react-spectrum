import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {LabelPosition, SpectrumRadioGroupProps} from '@react-types/radio';
import React, {forwardRef, useContext} from 'react';
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

export const RadioGroup = forwardRef((props: SpectrumRadioGroupProps, ref: DOMRef<HTMLDivElement>) => {
  let completeProps = useProviderProps(props);

  let {
    isEmphasized,
    isRequired,
    isReadOnly,
    isDisabled,
    labelPosition,
    validationState,
    children,
    orientation,
    ...otherProps
  } = completeProps;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let {selectedRadio, setSelectedRadio} = useRadioGroupState(completeProps);
  let {radioGroupProps, radioProps} = useRadioGroup(completeProps);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-FieldGroup',
          {
            'spectrum-FieldGroup--vertical': orientation === 'vertical'
          },
          styleProps.className
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
