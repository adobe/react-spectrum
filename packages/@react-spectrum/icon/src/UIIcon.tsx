import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

interface IconProps extends DOMProps, StyleProps {
  alt?: string,
  children: ReactElement,
  slot?: string
}

export function UIIcon(props: IconProps) {
  let {
    alt,
    children,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role = 'img',
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps({slot: 'uiIcon', ...otherProps});
  let provider = useProvider();
  let scale = 'M';
  if (provider !== null) {
    scale = provider.scale === 'large' ? 'L' : 'M';
  }

  if (!ariaHidden || ariaHidden === 'false') {
    ariaHidden = undefined;
  }

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    scale,
    focusable: 'false',
    'aria-label': ariaLabel || alt,
    'aria-hidden': (ariaLabel || alt ? ariaHidden : true),
    role,
    className: classNames(
      styles,
      children.props.className,
      'spectrum-Icon',
      {
        [`spectrum-UIIcon-${children.type['displayName']}`]: children.type['displayName']
      },
      styleProps.className)
  });
}
