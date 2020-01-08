import {classNames, filterDOMProps, useSlotProvider, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

type Scale = 'M' | 'L'

interface IconProps extends DOMProps, StyleProps {
  alt?: string,
  children: ReactElement,
  size?: 'XXS' | 'XS' | 'S' | 'M' | 'L' |'XL' | 'XXL',
  scale?: Scale,
  color?: string,
  slot?: string
}

export function Icon(props: IconProps) {
  let {
    children,
    alt,
    scale,
    color,
    size,
    slot = 'icon',
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role = 'img',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {[slot]: slotClassName} = useSlotProvider();

  let provider = useProvider();
  let pscale = 'M';
  let pcolor = 'LIGHT';
  if (provider !== null) {
    pscale = provider.scale === 'large' ? 'L' : 'M';
    pcolor = provider.colorScheme === 'dark' ? 'DARK' : 'LIGHT';
  }
  if (scale === undefined) {
    scale = pscale as Scale;
  }
  if (color === undefined) {
    color = pcolor;
  }
  if (!ariaHidden || ariaHidden === 'false') {
    ariaHidden = undefined;
  }

  // Use user specified size, falling back to provider scale if size is undef
  let iconSize = size ? size : scale;

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    scale: 'M',
    color,
    focusable: 'false',
    'aria-label': ariaLabel || alt,
    'aria-hidden': (ariaLabel || alt ? ariaHidden : true),
    role,
    className: classNames(
      styles,
      children.props.className,
      'spectrum-Icon',
      `spectrum-Icon--size${iconSize}`,
      styleProps.className,
      slotClassName)
  });
}
