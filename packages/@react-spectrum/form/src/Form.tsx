import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React, {forwardRef} from 'react';
import {SpectrumFormProps} from '@react-types/form';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

function Form({children, ...otherProps}: SpectrumFormProps, ref: DOMRef<HTMLFormElement>) {
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  return (
    <form
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={
        classNames(
          styles,
          'spectrum-Form',
          styleProps.className
        )
      }
      ref={domRef}>
      {children}
    </form>
  );
}

let _Form = forwardRef(Form);
export {_Form as Form};
