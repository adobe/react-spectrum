import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/rule/vars.css';
import {useSeparator} from '@react-aria/separator';

export interface DividerProps extends DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  orientation?: 'horizontal' | 'vertical'
}

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large'
};

export const Divider = React.forwardRef((props: DividerProps, ref: RefObject<HTMLElement>) => {
  let {
    size = 'L',
    orientation = 'horizontal',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let weight = sizeMap[size];

  let Element = 'hr';
  if (orientation === 'vertical') {
    Element = 'div';
  }
  let {separatorProps} = useSeparator(props, Element);
  return (
    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/28892
    <Element
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={
        classNames(
          styles,
          'spectrum-Rule',
          `spectrum-Rule--${weight}`,
          {'spectrum-Rule--vertical': orientation === 'vertical'},
          styleProps.className
        )
      }
      ref={ref}
      {...separatorProps} />
  );
});
