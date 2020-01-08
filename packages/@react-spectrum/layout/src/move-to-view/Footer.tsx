import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface FooterProps {
  children: ReactElement,
  className?: string,
  slot?: string
}

export const Footer = React.forwardRef((props: FooterProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = 'footer',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <footer {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </footer>
  );
});
