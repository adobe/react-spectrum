import {Form as RACForm, FormProps as RACFormProps} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {createContext, useContext, forwardRef, ReactNode} from 'react';
import {SpectrumLabelableProps, DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

interface FormStyleProps extends Omit<SpectrumLabelableProps, 'label' | 'contextualHelp'> {
  /**
   * Size of the Form elements.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the Form elements are disabled. */
  isDisabled?: boolean,
  /** Whether the Form elements are rendered with their emphasized style. */
  isEmphasized?: boolean
}

export interface FormProps extends FormStyleProps, Omit<RACFormProps, 'className' | 'style' | 'children'>, StyleProps {
  children?: ReactNode
}

export const FormContext = createContext<FormStyleProps | null>(null);
export function useFormProps<T extends FormStyleProps>(props: T): T {
  let ctx = useContext(FormContext);
  if (ctx) {
    return {...ctx, ...props};
  }

  return props;
}

function Form(props: FormProps, ref: DOMRef<HTMLFormElement>) {
  let {
    labelPosition = 'top',
    labelAlign,
    necessityIndicator,
    isRequired,
    isDisabled,
    isEmphasized,
    size = 'M',
    ...formProps
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <RACForm
      {...formProps}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + style({
        display: 'grid',
        gridTemplateColumns: {
          labelPosition: {
            top: ['[field] 1fr'],
            side: ['[label] auto', '[field] 1fr']
          }
        },
        // TODO: confirm when we have tokens
        rowGap: {
          size: {
            XS: 16,
            S: 20,
            M: 24,
            L: 32,
            XL: 40
          }
        },
        columnGap: 'text-to-control'
      }, getAllowedOverrides())({labelPosition, size}, props.styles)}>
      <FormContext.Provider
        value={{
          labelPosition,
          labelAlign,
          necessityIndicator,
          isRequired,
          isDisabled,
          isEmphasized,
          size
        }}>
        {props.children}
      </FormContext.Provider>
    </RACForm>
  );
}

/**
 * Forms allow users to enter data that can be submitted while providing alignment and styling for form fields.
 */
let _Form = /*#__PURE__*/ forwardRef(Form);
export {_Form as Form};
