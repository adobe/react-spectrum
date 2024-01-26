import {Form as RACForm, FormProps as RACFormProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {createContext, useContext} from 'react';
import {SpectrumLabelableProps} from '@react-types/shared';

interface FormStyleProps extends Omit<SpectrumLabelableProps, 'label' | 'contextualHelp'> {
  size?: 'S' | 'M' | 'L' | 'XL',
  isDisabled?: boolean,
  isEmphasized?: boolean
}

interface FormProps extends FormStyleProps, RACFormProps {}

export const FormContext = createContext<FormStyleProps | null>(null);
export function useFormProps<T extends FormStyleProps>(props: T): T {
  let ctx = useContext(FormContext);
  if (ctx) {
    return {...ctx, ...props};
  }

  return props;
}

export function Form(props: FormProps) {
  let {labelPosition = 'top', labelAlign, necessityIndicator, isRequired, isDisabled, isEmphasized, size, ...formProps} = props;

  return (
    <RACForm 
      {...formProps}
      className={style({
        display: 'grid',
        gridTemplateColumns: {
          labelPosition: {
            top: ['[field] 1fr'],
            side: ['[label] auto', '[field] 1fr']
          }
        },
        rowGap: 6, // TODO: confirm
        columnGap: 'text-to-control'
      })({labelPosition})}>
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
