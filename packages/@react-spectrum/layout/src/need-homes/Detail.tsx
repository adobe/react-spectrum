import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '../layout.css';
import {useSlotProvider} from '../Slots';

export interface DetailProps {
}

export const Detail = React.forwardRef((props: DetailProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'detail'};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <kbd {...filterDOMProps(otherProps)} ref={ref} className={classNames(styles, 'detail', slotClassName, className)}>
      {children}
    </kbd>
  );
});
