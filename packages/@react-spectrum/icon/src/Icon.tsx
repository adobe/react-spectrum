import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, SVGAttributes} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

interface IconProps extends SVGAttributes<SVGElement> {
  alt?: string,
  children: ReactElement,
  size?: 'XXS' | 'XS' | 'S' | 'M' | 'L' |'XL' | 'XXL'
}

export function Icon(props: IconProps) {
  let {
    children,
    alt,
    className,
    scale,
    color,
    size,
    ...otherProps
  } = props;

  let provider = useProvider();
  let pscale = 'M';
  let pcolor = 'LIGHT';
  if (provider !== null) {
    pscale = provider.scale === 'large' ? 'L' : 'M';
    pcolor = provider.colorScheme === 'dark' ? 'DARK' : 'LIGHT';
  }
  if (scale === undefined) {
    scale = pscale;
  }
  if (color === undefined) {
    color = pcolor;
  }

  // Use user specified size, falling back to provider scale if size is undef
  let iconSize = size ? size : scale;

  return React.cloneElement(children, {
    ...otherProps,
    scale: 'M',
    color,
    focusable: 'false',
    'aria-label': props['aria-label'] || alt,
    'aria-hidden': (props['aria-label'] || alt ? null : true),
    role: 'img',
    className: classNames(
      styles,
      children.props.className,
      'spectrum-Icon',
      `spectrum-Icon--size${iconSize}`,
      className)
  });
}
