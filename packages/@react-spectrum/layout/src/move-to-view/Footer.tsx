import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '../Slots';

export interface FooterProps {
  children: ReactElement,
  className?: string,
  slot?: string
}

export const Footer = React.forwardRef((props: FooterProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'footer'};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <footer {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </footer>
  );
});
