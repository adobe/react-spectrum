import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared/src';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/rule/vars.css';
import {useSeparator} from '@react-aria/separator';

export interface DividerProps extends DOMProps {
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
    className,
    ...otherProps
  } = props;
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
      className={
        classNames(
          styles,
          'spectrum-Rule',
          `spectrum-Rule--${weight}`,
          {'spectrum-Rule--vertical': orientation === 'vertical'},
          className
        )
      }
      ref={ref}
      {...separatorProps} />
  );
});
