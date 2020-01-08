import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface ContentProps {
  children: ReactElement | string,
  className?: string,
  slot?: string
}

export const Content = React.forwardRef((props: ContentProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = 'content',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();

  return (
    <section {...filterDOMProps(otherProps)} ref={ref} className={classNames({}, slotClassName, className)}>
      {children}
    </section>
  );
});
