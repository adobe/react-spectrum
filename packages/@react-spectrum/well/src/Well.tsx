import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {forwardRef, ReactNode, RefObject} from 'react';
import styles from '@spectrum-css/well/dist/index-vars.css';

interface WellProps extends React.AllHTMLAttributes<HTMLElement> {
  children: ReactNode
}

export const Well = forwardRef(({
  children,
  className,
  ...otherProps}: WellProps,
  ref: RefObject<HTMLDivElement>) => (
    <div
      {...filterDOMProps(otherProps)}
      ref={ref}
      className={classNames(
        styles,
        'spectrum-Well',
        className
      )}>
      {children}
    </div>
  )
);
