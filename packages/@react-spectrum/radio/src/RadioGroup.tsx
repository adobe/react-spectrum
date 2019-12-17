import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import React, {forwardRef, useContext} from 'react';
import {SpectrumRadioGroupProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useRadioGroup} from '@react-aria/radio';
import {useRadioGroupState} from '@react-stately/radio';

interface RadioGroupContext {
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  isEmphasized?: boolean,
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
  props = useProviderProps(props);
  let {
    isEmphasized,
    isRequired,
    necessityIndicator,
    isReadOnly,
    isDisabled,
    label,
    labelPosition,
    labelAlign,
    validationState,
    children,
    orientation = 'vertical',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let {selectedRadio, setSelectedRadio} = useRadioGroupState(props);
  let {radioGroupProps, labelProps, radioProps} = useRadioGroup(props);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...radioGroupProps}
      className={
        classNames(
          styles,
          'spectrum-FieldGroup',
          {
            'spectrum-FieldGroup--horizontal': labelPosition === 'side'
          },
          styleProps.className
        )
      }
      ref={domRef}>
      {label && 
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}>
          {label}
        </Label>
      }
      <div
        className={
          classNames(
            styles,
            'spectrum-FieldGroup',
            {
              'spectrum-FieldGroup--horizontal': orientation === 'horizontal'
            }
          )
        }>
        <RadioContext.Provider
          value={{
            isEmphasized,
            isRequired,
            isReadOnly,
            isDisabled,
            validationState,
            name: radioProps.name,
            selectedRadio,
            setSelectedRadio
          }}>
          {children}
        </RadioContext.Provider>
      </div>
    </div>
  );
});
