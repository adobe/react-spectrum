import {baseStyleProps, classNames, filterDOMProps, flexStyleProps, useStyleProps} from '@react-spectrum/utils';
import {FlexProps} from '@react-types/layout';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from './layout.css';

export const Flex = React.forwardRef((props: FlexProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, {...baseStyleProps, ...flexStyleProps});

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref} className={classNames(styles, 'flex', styleProps.className)}>
      {children}
    </div>
  );
});
