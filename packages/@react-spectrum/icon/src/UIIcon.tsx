import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';

interface IconProps extends DOMProps, StyleProps {
  alt?: string,
  children: ReactElement
}

export function UIIcon(props: IconProps) {
  let {
    alt,
    children,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let provider = useProvider();
  let scale = 'M';
  if (provider !== null) {
    scale = provider.scale === 'large' ? 'L' : 'M';
  }

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    scale,
    focusable: 'false',
    'aria-label': props['aria-label'] || alt,
    'aria-hidden': (props['aria-label'] || alt ? null : true),
    role: 'presentation',
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
