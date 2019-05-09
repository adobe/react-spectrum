import {classNames} from '@react-spectrum/utils/src/classNames';
import filterDOMProps from '@react-spectrum/utils/src/filterDOMProps';
import React, {ReactNode} from 'react';

import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';

interface StatusLightProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode,
  variant?: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}

export function StatusLight({variant = 'positive', children, isDisabled, className, ...otherProps}: StatusLightProps) {
  return (
    <div
      className={classNames(
        styles,
        'spectrum-StatusLight',
        `spectrum-StatusLight--${variant}`,
        {
          'is-disabled': isDisabled
        },
        className)}
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}
