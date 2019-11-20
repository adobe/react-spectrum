import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '../layout.css';
import {useSlotProvider} from '../Slots';

export interface LabelProps {
}

// this is a weird, one, Label is typically something for inputs, but in the case of menu items, it isn't, not sure where to go...
export const Label = React.forwardRef((props: LabelProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'label'};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <div {...filterDOMProps(otherProps)} ref={ref} className={classNames(styles, 'label', slotClassName, className)}>
      {children}
    </div>
  );
});
