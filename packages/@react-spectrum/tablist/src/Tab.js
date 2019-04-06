import filterDOMProps from '@react-spectrum/utils/src/filterDOMProps';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {classNames} from '@react-spectrum/utils/src/classNames';

export function Tab(props) {
  // v3 come up with rule for how to handle props and dom props issue
  // v3 Always use classNames even when only one class because of modules and "turnonclassname" option
  let {label, disabled, ...otherProps} = props;
  return (
    <div
      {...filterDOMProps(otherProps)}
      className={classNames(
        styles,
        'spectrum-Tabs-item',
        {
          'is-selected': otherProps['aria-selected'],
          'is-disabled': disabled,
        },
        otherProps.className
      )}>
      <span className={classNames(styles, "spectrum-Tabs-itemLabel")}>{label}</span>
    </div>
  );

}
