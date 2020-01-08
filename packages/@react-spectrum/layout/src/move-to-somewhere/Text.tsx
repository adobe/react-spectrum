import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, ReactNode, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface TextProps {
  children: ReactElement | ReactNode,
  className?: string,
  slot?: string
}

export const Text = React.forwardRef((props: TextProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = 'label', // unsure about this name
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <span {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </span>
  );
});
