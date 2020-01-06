import {baseStyleProps, classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import styles from './layout.css';
import {useSlotProvider} from './Slots';

export interface FlexProps {
  children: ReactElement | ReactElement[],
  className?: string,
  slot?: string
}

export const Flex = React.forwardRef((props: FlexProps, ref: RefObject<HTMLElement>) => {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, props);
  let {
    children,
    className,
    slot,
    ...otherProps
  } = completeProps;
  let {[slot]: slotClassName} = useSlotProvider();
  // TODO: pull out into official handling
  let {styleProps} = useStyleProps(otherProps, {...baseStyleProps, justifyContent: ['justify-content', value => value], alignItems: ['align-items', value => value]});

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref} className={classNames(styles, 'flex', slotClassName, className)}>
      {children}
    </div>
  );
});
