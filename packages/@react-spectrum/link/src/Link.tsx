import {classNames, filterDOMProps, getWrappedElement, useStyleProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SpectrumLinkProps} from '@react-types/link';
import styles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {useLink} from '@react-aria/link';
import {useProviderProps} from '@react-spectrum/provider';

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
