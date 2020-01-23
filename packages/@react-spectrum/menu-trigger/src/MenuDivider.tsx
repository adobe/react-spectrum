import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

export function MenuDivider() {
  return (
    <div 
      aria-orientation="horizontal"
      className={classNames(
        styles,
        'spectrum-Menu-divider'
      )}
      role="separator" />
  );
}
