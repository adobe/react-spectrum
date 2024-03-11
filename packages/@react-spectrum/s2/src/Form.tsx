import {Form as RACForm, FormProps as RACFormProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {createContext, useContext, forwardRef, ReactNode} from 'react';
import {SpectrumLabelableProps, DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

interface FormStyleProps extends Omit<SpectrumLabelableProps, 'label' | 'contextualHelp'> {
  size?: 'S' | 'M' | 'L' | 'XL',
  isDisabled?: boolean,
  isEmphasized?: boolean
}

interface FormProps extends FormStyleProps, Omit<RACFormProps, 'className' | 'style' | 'children'>, StyleProps {
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
  let {labelPosition = 'top', labelAlign, necessityIndicator, isRequired, isDisabled, isEmphasized, size, ...formProps} = props;
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
        rowGap: 24, // TODO: confirm
        columnGap: 'text-to-control'
      }, getAllowedOverrides())({labelPosition}, props.css)}>
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

let _Form = forwardRef(Form);
export {_Form as Form};
