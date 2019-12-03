import {classNames} from '@react-spectrum/utils';
import {FormItemProps} from './types';
import {LabelBase} from './LabelBase';
import React, {forwardRef, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

export const FormItem = forwardRef(({label, labelAlign = 'start', labelFor, className, children, ...otherProps}: FormItemProps, ref: RefObject<HTMLDivElement> & RefObject<HTMLLabelElement>) => {
  let labelClassNames = classNames(
    styles,
    'spectrum-Form-itemLabel',
    labelAlign === 'start' ? 'spectrum-FieldLabel--alignStart' : 'spectrum-FieldLabel--alignEnd'
  );

  let wrapperClassName = classNames(
    styles,
    'spectrum-Form-itemField',
  );

  return (
    <LabelBase
      {...otherProps}
      label={label}
      className={
        classNames(
          styles,
          'spectrum-Form-item',
          className
        )
      }
      labelClassName={labelClassNames}
      wrapperClassName={wrapperClassName}
      labelFor={labelFor}
      componentName="FormItem"
      ref={ref}>
      {children}
    </LabelBase>
  );
});
