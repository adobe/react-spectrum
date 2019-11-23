import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '../Slots';

export interface HeadingProps {
  children: ReactElement,
  className?: string,
  slot?: string
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
    <h1 {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </h1>
  );
});
