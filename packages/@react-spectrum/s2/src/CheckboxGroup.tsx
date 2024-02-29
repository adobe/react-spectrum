import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  // eslint-disable-next-line
  CheckboxProps as AriaCheckboxProps,
  ValidationResult
} from 'react-aria-components';
import React, {useContext, forwardRef} from 'react';
import {FormContext, useFormProps} from './Form';
import {FieldLabel, HelpText} from './Field';
import {SpectrumLabelableProps, Orientation, DOMRef} from '@react-types/shared';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {field} from './style-utils' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children'>, SpectrumLabelableProps {
  children?: React.ReactNode,
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string),
  size?: 'S' | 'M' | 'L' | 'XL',
  orientation?: Orientation
}

function CheckboxGroup(props: CheckboxGroupProps, ref: DOMRef<HTMLDivElement>) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    description,
    errorMessage,
    children,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    size = 'M',
    orientation = 'vertical',
    ...groupProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <AriaCheckboxGroup 
      {...groupProps}
      ref={domRef}
      className={style({
        ...field(),
        // Double the usual gap because of the internal padding within checkbox that spectrum has.
        '--field-gap': {
          type: 'rowGap',
          value: '[calc(var(--field-height) - 1lh)]'
        }
      })({
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      })}>
      {({isDisabled, isInvalid}) => (<>
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
            lineHeight: 100,
            rowGap: '--field-gap',
            // Spectrum uses a fixed spacing value for horizontal, 
            // but the gap changes depending on t-shirt size in vertical.
            columnGap: 4,
            flexWrap: 'wrap'
          })({orientation})}>
          <FormContext.Provider value={{...formContext, size}}>
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
      </>)}
    </AriaCheckboxGroup>
  );
}

let _CheckboxGroup = forwardRef(CheckboxGroup);
export {_CheckboxGroup as CheckboxGroup};
