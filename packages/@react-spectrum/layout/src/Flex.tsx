import {baseStyleProps, classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';
import styles from './layout.css';
import {useSlotProvider} from '@react-spectrum/utils';

export interface FlexProps {
  children?: ReactElement | ReactElement[],
  className?: string,
  slot?: string,
  justifyItems?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'left' | 'right' | 'stretch' | 'space-between',
  alignItems?: 'auto' | 'normal' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'self-start' | 'self-end' | 'center' | 'stretch'
}

export const Flex = React.forwardRef((props: FlexProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    slot = '',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();
  // TODO: pull out into official handling
  let {styleProps} = useStyleProps(otherProps, {...baseStyleProps, justifyContent: ['justify-content', value => value], alignItems: ['align-items', value => value]});

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref} className={classNames(styles, 'flex', slotClassName, className)}>
      {children}
    </div>
  );
});
