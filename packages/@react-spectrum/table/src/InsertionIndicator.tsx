import {classNames} from '@react-spectrum/utils';
import {ItemDropTarget} from '@react-types/shared';
import React, {useCallback, useRef} from 'react';
import styles from './table.css';
import {useTableContext} from './TableView';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface InsertionIndicatorProps {
  target: ItemDropTarget,
  rowProps: any
}

export default function InsertionIndicator(props: InsertionIndicatorProps) {
  let {dropState, dragAndDropHooks, state} = useTableContext();
  const {target, rowProps} = props;

  let getKeyBefore = useCallback((key) => {
    let keyBefore = state.collection.getKeyBefore(key);
    if (state.collection.getItem(keyBefore)?.type === 'headerrow') {
      return null;
    }
    return keyBefore;
  }, [state.collection]);

  let ref = useRef();
  let {dropIndicatorProps} = dragAndDropHooks.useDropIndicator({...props, getKeyBefore}, dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  let isDropTarget = dropState.isDropTarget(target);

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: rowProps.style.top + (target.dropPosition === 'after' ? rowProps.style.height : 0),
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
