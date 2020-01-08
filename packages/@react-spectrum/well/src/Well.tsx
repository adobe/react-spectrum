import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React, {forwardRef} from 'react';
import {SpectrumWellProps} from '@react-types/well';
import styles from '@adobe/spectrum-css-temp/components/well/vars.css';

function Well(props: SpectrumWellProps, ref: DOMRef<HTMLDivElement>) {
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
