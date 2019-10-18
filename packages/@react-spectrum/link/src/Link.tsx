import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {HTMLElement} from 'react-dom';
import {LinkProps} from '@react-types/link';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {useLink} from '@react-aria/link';

export interface SpectrumLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'overBackground',
  isQuiet?: boolean
}

export const Link = React.forwardRef((props: SpectrumLinkProps, ref: RefObject<HTMLElement>) => {
  let {
    variant = 'primary',
    isQuiet,
    className,
    children,
    ...otherProps
  } = props;

  let {linkProps} = useLink(props);

  let element;
  if (typeof children === 'string') {
    element = React.createElement('span', null, children);
  } else {
    element = React.Children.only(children);
  }

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      {React.cloneElement(element, {
        ...filterDOMProps(otherProps),
        ...linkProps,
        ref,
        className: classNames(
          styles,
          'spectrum-Link',
          {
            'spectrum-Link--quiet': isQuiet,
            [`spectrum-Link--${variant}`]: variant
          },
          className
        )
      })}
    </FocusRing>
  );
});
