import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {forwardRef, ReactNode, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

interface StatusLightProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode,
  variant?: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}

export const StatusLight = forwardRef((props: StatusLightProps, ref: RefObject<HTMLDivElement>) => {
  let {
    variant = 'positive',
    children,
    isDisabled,
    className,
    'aria-label': ariaLabel,
    ...otherProps
  } = useProviderProps(props);

  if (!children && !ariaLabel) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      aria-label={ariaLabel}
      className={classNames(
        styles,
        'spectrum-StatusLight',
        `spectrum-StatusLight--${variant}`,
        {
          'is-disabled': isDisabled
        },
        className)}
      ref={ref} >
      {children}
    </div>
  );
});
