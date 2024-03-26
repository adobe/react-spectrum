import {
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps
} from 'react-aria-components';
import {useContext, forwardRef, ReactNode} from 'react';
import {FormContext, useFormProps} from './Form';
import {FieldLabel, HelpText} from './Field';
import {SpectrumLabelableProps, Orientation, DOMRef, HelpTextProps} from '@react-types/shared';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {CheckboxContext} from './Checkbox';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'className' | 'style' | 'children'>, StyleProps, Omit<SpectrumLabelableProps, 'contextualHelp'>, HelpTextProps {
  /**
   * The size of the Checkboxes in the CheckboxGroup.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The axis the checkboxes should align with.
   *
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * The Checkboxes contained within the CheckboxGroup.
   */
  children?: ReactNode,
  /**
   * By default, checkboxes are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
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
    UNSAFE_className = '',
    UNSAFE_style,
    isEmphasized,
    ...groupProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <AriaCheckboxGroup
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
        size: props.size,
        labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
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
            gridArea: 'input',
            display: 'flex',
            flexDirection: {
              orientation: {
                vertical: 'column',
                horizontal: 'row'
              }
            },
            lineHeight: 'ui',
            rowGap: '--field-gap',
            // Spectrum uses a fixed spacing value for horizontal,
            // but the gap changes depending on t-shirt size in vertical.
            columnGap: 16,
            flexWrap: 'wrap'
          })({orientation})}>
          <FormContext.Provider value={{...formContext, size}}>
            <CheckboxContext.Provider value={{isEmphasized}}>
              {children}
            </CheckboxContext.Provider>
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

/**
 * A CheckboxGroup allows users to select one or more items from a list of choices.
 */
let _CheckboxGroup = forwardRef(CheckboxGroup);
export {_CheckboxGroup as CheckboxGroup};
