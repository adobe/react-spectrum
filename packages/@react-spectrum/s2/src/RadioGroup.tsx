import {DOMRef, HelpTextProps, Orientation, SpectrumLabelableProps} from '@react-types/shared';
import {field, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps
} from 'react-aria-components';
import React, {forwardRef, ReactNode, useContext} from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style' | 'children'>, StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The Radios contained within the RadioGroup.
   */
  children?: ReactNode,
  /**
   * The size of the RadioGroup.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The axis the radio elements should align with.
   *
   * @default "vertical"
   */
  orientation?: Orientation,
  /**
   * Whether the RadioGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean
}

function RadioGroup(props: RadioGroupProps, ref: DOMRef<HTMLDivElement>) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let domRef = useDOMRef(ref);

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
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style({
        ...field(),
        // Double the usual gap because of the internal padding within checkbox that spectrum has.
        '--field-gap': {
          type: 'rowGap',
          value: '[calc(var(--field-height) - 1lh)]'
        }
      }, getAllowedOverrides())({
        size,
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

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 * All possible options are exposed up front for users to compare.
 */
let _RadioGroup = /*#__PURE__*/ forwardRef(RadioGroup);
export {_RadioGroup as RadioGroup};
