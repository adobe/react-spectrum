import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, LabelPosition} from '@react-types/shared';
import {Label} from '@react-spectrum/label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import React, {forwardRef, useContext} from 'react';
import {SpectrumRadioGroupProps} from '@react-types/radio';
import styles from '@adobe/spectrum-css-temp/components/fieldgroup/vars.css';
import {useFormProps} from '@react-spectrum/form';
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

function RadioGroup(props: SpectrumRadioGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    isEmphasized,
    isRequired,
    necessityIndicator,
    isReadOnly,
    isDisabled,
    label,
    labelPosition = 'top' as LabelPosition,
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
            'spectrum-FieldGroup--positionSide': labelPosition === 'side'
          },
          // This is so radio works inside a <Form>
          classNames(
            labelStyles,
            'spectrum-Field'
          ),
          styleProps.className
        )
      }
      ref={domRef}>
      {label && 
        <Label
          {...labelProps}
          elementType="span"
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
            'spectrum-FieldGroup-group',
            {
              'spectrum-FieldGroup-group--horizontal': orientation === 'horizontal'
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
}

const _RadioGroup = React.forwardRef(RadioGroup);
export {_RadioGroup as RadioGroup};
