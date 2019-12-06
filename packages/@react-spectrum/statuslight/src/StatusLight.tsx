import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import React, {forwardRef, ReactNode} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

interface StatusLightProps extends DOMProps, StyleProps {
  children: ReactNode,
  variant?: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}

function StatusLight(props: StatusLightProps, ref: DOMRef<HTMLDivElement>) {
  let {
    variant = 'positive',
    children,
    isDisabled,
    ...otherProps
  } = useProviderProps(props);
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  if (!props.children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={classNames(
        styles,
        'spectrum-StatusLight',
        `spectrum-StatusLight--${variant}`,
        {
          'is-disabled': isDisabled
        },
        styleProps.className
      )}
      ref={domRef} >
      {children}
    </div>
  );
}

let _StatusLight = forwardRef(StatusLight);
export {_StatusLight as StatusLight};
