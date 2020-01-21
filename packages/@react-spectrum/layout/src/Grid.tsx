import {classNames, filterDOMProps, gridStyleProps, SlotContext, useStyleProps} from '@react-spectrum/utils';
import {GridProps} from '@react-types/layout';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';


export const Grid = React.forwardRef((props: GridProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    slots,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, gridStyleProps);
  styleProps.style.display = 'grid'; // inline-grid?

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref} className={classNames({}, slots && slots.container, styleProps.className)}>
      <SlotContext.Provider value={slots}>
        {children}
      </SlotContext.Provider>
    </div>
  );
});
