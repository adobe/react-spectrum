import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, ReactNode, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface KeyboardProps {
  children: ReactElement | ReactNode,
  className?: string,
  slot?: string
}

export const Keyboard = React.forwardRef((props: KeyboardProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = 'keyboard',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <kbd {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </kbd>
  );
});
