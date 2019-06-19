import {classNames} from '@react-spectrum/utils/src/classNames';
import {filterDOMProps} from '@react-spectrum/utils';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/well/vars.css';

interface WellProps extends React.AllHTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function Well({
  children,
  className,
  ...otherProps}: WellProps) {

  return (
    <div
      {...filterDOMProps(otherProps)}
      className={classNames(
        styles,
        'spectrum-Well',
        className
      )}>
      {children}
    </div>
  );
}
