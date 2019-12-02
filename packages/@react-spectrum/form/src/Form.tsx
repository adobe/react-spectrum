import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FormProps} from './types';
import React, {forwardRef, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {useStyleProps} from '@react-spectrum/view';

export const Form = forwardRef(({children, ...otherProps}: FormProps, ref: RefObject<HTMLFormElement>) => {
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
      ref={ref}>
      {children}
    </form>
  );
});
