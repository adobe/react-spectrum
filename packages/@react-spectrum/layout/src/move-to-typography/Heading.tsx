import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface HeadingProps {
  children: ReactElement | string,
  className?: string,
  slot?: string
}

export const Heading = React.forwardRef((props: HeadingProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = 'heading',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <h1 {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </h1>
  );
});
