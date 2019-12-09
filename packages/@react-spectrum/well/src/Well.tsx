import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import React, {forwardRef, ReactNode} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/well/vars.css';

interface WellProps extends DOMProps, StyleProps {
  children: ReactNode
}

function Well(props: WellProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={classNames(
        styles,
        'spectrum-Well',
        styleProps.className
      )}>
      {children}
    </div>
  );
}

const _Well = forwardRef(Well);
export {_Well as Well};
