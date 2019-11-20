import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '../layout.css';
import {useSlotProvider} from '../Slots';

export interface LabelProps {
}

export const Label = React.forwardRef((props: LabelProps, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot ? slot : 'label']: slotClassName} = useSlotProvider();

  return (
    <div {...filterDOMProps(otherProps)} ref={ref} className={classNames(styles, 'label', slotClassName, className)}>
      {children}
    </div>
  );
});
