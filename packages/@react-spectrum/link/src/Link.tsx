import {classNames, filterDOMProps, getWrappedElement} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {LinkProps} from '@react-types/link';
import React from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {useLink} from '@react-aria/link';
import {useProviderProps} from '@react-spectrum/provider';

export interface SpectrumLinkProps extends LinkProps, DOMProps, StyleProps {
  variant?: 'primary' | 'secondary' | 'overBackground',
  isQuiet?: boolean
}

export function Link(props: SpectrumLinkProps) {
  props = useProviderProps(props);
  let {
    variant = 'primary',
    isQuiet,
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props);
  let {linkProps} = useLink(props);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      {React.cloneElement(
        getWrappedElement(children),
        {
          ...filterDOMProps(otherProps),
          ...styleProps,
          ...linkProps,
          className: classNames(
            styles,
            'spectrum-Link',
            {
              'spectrum-Link--quiet': isQuiet,
              [`spectrum-Link--${variant}`]: variant
            },
            styleProps.className
          )
        }
      )}
    </FocusRing>
  );
}
