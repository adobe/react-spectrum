import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {FormProps} from './types';
import React, {forwardRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {useStyleProps} from '@react-spectrum/view';

function Form({children, ...otherProps}: FormProps, ref: DOMRef<HTMLFormElement>) {
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
