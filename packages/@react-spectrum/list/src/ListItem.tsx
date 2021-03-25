import {classNames} from '@react-spectrum/utils';
import {ListContext} from './List';
import listStyles from './index.css';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useHover} from '@react-aria/interactions';


export function ListItem(props) {
  let {
    item
  } = props;
  let {state} = useContext(ListContext);
  let ref = useRef<HTMLDivElement>();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    ref
  }, state);
  let {gridCellProps} = useGridCell({
    node: item,
    ref,
    focusMode: 'cell'
  }, state);
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps
  );

  return (
    <div {...rowProps}>
      <div
        className={
          classNames(
            listStyles,
            'react-spectrum-ListItem',
            {
              'is-focused': isFocusVisibleWithin,
              'focus-ring': isFocusVisible,
              'is-hovered': isHovered
            }
          )
        }
        ref={ref}
        {...mergedProps}>
        {item.rendered}
      </div>
    </div>
  );
}
