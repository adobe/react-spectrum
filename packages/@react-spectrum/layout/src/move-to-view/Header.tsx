import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface HeaderProps {
  children: ReactElement,
  className?: string,
  slot?: string
}

export const Header = React.forwardRef((props: HeaderProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'header'};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <header {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </header>
  );
});
