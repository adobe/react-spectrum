import {Alignment, DOMRef, LabelPosition, SpectrumLabelableProps} from '@react-types/shared';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React, {useContext} from 'react';
import {SpectrumFormProps} from '@react-types/form';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

let FormContext = React.createContext<SpectrumLabelableProps>({});
export function useFormProps<T extends SpectrumLabelableProps>(props: T): T {
  let ctx = useContext(FormContext);
  return {...props, ...ctx};
}

function Form(props: SpectrumFormProps, ref: DOMRef<HTMLFormElement>) {
  props = useProviderProps(props);
  let {
    children,
    labelPosition = 'top' as LabelPosition,
    labelAlign = 'start' as Alignment,
    isRequired,
    necessityIndicator,
    isQuiet,
    isEmphasized,
    isDisabled,
    isReadOnly,
    validationState,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps({slot: 'form', ...otherProps});
  let domRef = useDOMRef(ref);

  let ctx = {
    labelPosition,
    labelAlign,
    necessityIndicator
  };

  return (
    <form
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Form',
          {
            'spectrum-Form--positionSide': labelPosition === 'side',
            'spectrum-Form--positionTop': labelPosition === 'top'
          },
          styleProps.className
        )
      }>
      <FormContext.Provider value={ctx}>
        <Provider
          isQuiet={isQuiet}
          isEmphasized={isEmphasized}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          isRequired={isRequired}
          validationState={validationState}>
          {children}
        </Provider>
      </FormContext.Provider>
    </form>
  );
}

const _Form = React.forwardRef(Form);
export {_Form as Form};
