import {classNames} from '@react-spectrum/utils';
import {FocusableElement, ItemDropTarget} from '@react-types/shared';
import React, {DOMAttributes, HTMLAttributes, useRef} from 'react';
import styles from './table.css';
import {useTableContext} from './TableView';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface InsertionIndicatorProps {
  target: ItemDropTarget,
  rowProps: HTMLAttributes<HTMLElement> & DOMAttributes<FocusableElement>
}

export function InsertionIndicator(props: InsertionIndicatorProps) {
  let {dropState, dragAndDropHooks} = useTableContext();
  const {target, rowProps} = props;

  let ref = useRef();
  let {dropIndicatorProps} = dragAndDropHooks.useDropIndicator(props, dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  let isDropTarget = dropState.isDropTarget(target);

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: rowProps.style.top as number + (target.dropPosition === 'after' ? rowProps.style.height as number : 0),
        width: rowProps.style.width
      }}
      role="row"
      aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        className={
          classNames(
            styles,
            'react-spectrum-Table-InsertionIndicator',
            {
              'react-spectrum-Table-InsertionIndicator--dropTarget': isDropTarget
            }
        )}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
