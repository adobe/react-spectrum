import {classNames} from '@react-spectrum/utils';
import {FieldLabelProps} from './types';
import {LabelBase} from './LabelBase';
import React, {forwardRef, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

export const FieldLabel = forwardRef(({label, labelAlign, labelFor, children, ...otherProps}: FieldLabelProps, ref: RefObject<HTMLDivElement> & RefObject<HTMLLabelElement>) => {
  let labelClassNames = classNames(
    styles,
    'spectrum-FieldLabel',
    {
      'spectrum-FieldLabel--alignStart': labelAlign === 'start',
      'spectrum-FieldLabel--alignEnd': labelAlign === 'end'
    }
  );

  return (
    <LabelBase
      {...otherProps}
      label={label}
      labelClassName={labelClassNames}
      labelFor={labelFor}
      componentName="FieldLabel"
      ref={ref}>
      {children}
    </LabelBase>
  );
});
