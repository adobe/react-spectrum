import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '../layout.css';
import {useSlotProvider} from '../Slots';

export interface HeadingProps {
}

export const Heading = React.forwardRef((props: HeadingProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'heading'};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <h1 {...filterDOMProps(otherProps)} ref={ref} className={classNames(styles, 'heading', slotClassName, className)}>
      {children}
    </h1>
  );
});
