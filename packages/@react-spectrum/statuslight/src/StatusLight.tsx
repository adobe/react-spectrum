import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React, {forwardRef} from 'react';
import {SpectrumStatusLightProps} from '@react-types/statuslight';
import styles from '@adobe/spectrum-css-temp/components/statuslight/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

function StatusLight(props: SpectrumStatusLightProps, ref: DOMRef<HTMLDivElement>) {
  let {
    variant,
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
      ref={domRef}>
      {children}
    </div>
  );
}

let _StatusLight = forwardRef(StatusLight);
export {_StatusLight as StatusLight};
