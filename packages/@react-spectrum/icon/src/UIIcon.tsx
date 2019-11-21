import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, SVGAttributes} from 'react';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useProvider} from '@react-spectrum/provider';
import {useSlotProvider} from "@react-spectrum/layout";

interface IconProps extends SVGAttributes<SVGElement> {
  alt?: string,
  children: ReactElement
}

export function UIIcon(props: IconProps) {
  let {
    alt,
    className,
    children,
    slot = 'uiIcon',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  let provider = useProvider();
  let scale = 'M';
  if (provider !== null) {
    scale = provider.scale === 'large' ? 'L' : 'M';
  }

  return React.cloneElement(children, {
    ...otherProps,
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
      slotClassName,
      className)
  });
}
