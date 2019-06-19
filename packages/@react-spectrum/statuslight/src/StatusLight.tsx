import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

interface StatusLightProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode,
  variant?: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}

export function StatusLight(props: StatusLightProps) {
  let {
    variant = 'positive',
    children,
    isDisabled,
    className,
    ...otherProps
  } = useProviderProps(props);

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
