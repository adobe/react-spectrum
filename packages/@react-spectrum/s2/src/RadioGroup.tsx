import {StyleProps, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {Orientation, SpectrumLabelableProps} from '@react-types/shared';
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  ValidationResult
} from 'react-aria-components';
import React, {useContext} from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps {
  children?: React.ReactNode,
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL',
  orientation?: Orientation,
  isEmphasized?: boolean
}

export function RadioGroup(props: RadioGroupProps) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    children,
    isEmphasized,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    size = 'M',
    orientation = 'vertical',
    UNSAFE_className = '',
    UNSAFE_style,
    ...groupProps
  } = props;
  return (
    <AriaRadioGroup
      {...groupProps}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        // Double the usual gap because of the internal padding within checkbox that spectrum has.
        '--field-gap': {
          type: 'rowGap',
          value: '[calc(var(--field-height) - 1lh)]'
        }
      }, getAllowedOverrides())({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }, props.css)}>
      {({isDisabled, isInvalid}) => (
        <>
          <FieldLabel
            isDisabled={isDisabled}
            isRequired={props.isRequired}
            size={size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            necessityIndicator={necessityIndicator}>
            {label}
          </FieldLabel>
          <div
            className={style({
              display: 'flex',
              flexDirection: {
                orientation: {
                  vertical: 'column',
                  horizontal: 'row'
                }
              },
              flexWrap: 'wrap',
              // Spectrum uses a fixed spacing value for horizontal (column),
              // but the gap changes depending on t-shirt size in vertical (row).
              columnGap: 16,
              rowGap: '--field-gap'
            })({orientation})}>
            <FormContext.Provider value={{...formContext, size, isEmphasized}}>
              {children}
            </FormContext.Provider>
          </div>
          <HelpText
            size={size}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={description}>
            {errorMessage}
          </HelpText>
        </>
      )}
    </AriaRadioGroup>
  );
}
