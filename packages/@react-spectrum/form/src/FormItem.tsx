import {classNames} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {LabelBase} from './LabelBase';
import React, {forwardRef} from 'react';
import {SpectrumFormItemProps} from '@react-types/form';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';

function FormItem(props: SpectrumFormItemProps, ref: DOMRef<HTMLLabelElement & HTMLDivElement>) {
  let {label, labelAlign = 'start', labelFor, children, ...otherProps} = props;
  let labelClassNames = classNames(
    styles,
    'spectrum-Form-itemLabel',
    labelAlign === 'start' ? 'spectrum-FieldLabel--alignStart' : 'spectrum-FieldLabel--alignEnd'
  );

  let wrapperClassName = classNames(
    styles,
    'spectrum-Form-itemField'
  );

  return (
    <LabelBase
      {...otherProps}
      label={label}
      UNSAFE_className={
        classNames(
          styles,
          'spectrum-Form-item',
          otherProps.UNSAFE_className
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
}

let _FormItem = forwardRef(FormItem);
export {_FormItem as FormItem};
