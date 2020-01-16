import {baseStyleProps, classNames, filterDOMProps, gridStyleProps, SlotContext, useStyleProps} from '@react-spectrum/utils';
import {GridProps} from '@react-types/layout';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from './layout.css';


export const Grid = React.forwardRef((props: GridProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    slots,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, {...baseStyleProps, ...gridStyleProps});

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref} className={classNames(styles, 'grid', slots && slots.container, styleProps.className)}>
      <SlotContext.Provider value={slots}>
        {children}
      </SlotContext.Provider>
    </div>
  );
});
