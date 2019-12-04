import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import React, {forwardRef, ReactNode, RefObject} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/well/vars.css';

interface WellProps extends DOMProps, StyleProps {
  children: ReactNode
}

export const Well = forwardRef((props: WellProps, ref: RefObject<HTMLDivElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={ref}
      className={classNames(
        styles,
        'spectrum-Well',
        styleProps.className
      )}>
      {children}
    </div>
  );
});
