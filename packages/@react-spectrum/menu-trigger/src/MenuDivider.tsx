import {classNames} from '@react-spectrum/utils';
import {Divider} from '@react-spectrum/divider';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';

export function MenuDivider() {
  return (
    <Divider 
      size="M"
      UNSAFE_className={classNames(
        styles,
        'spectrum-Menu-divider'
      )} />
  );
}
