import {classNames} from '@react-spectrum/utils';
import {ItemDropTarget} from '@react-types/shared';
import React, {useRef} from 'react';
import styles from './table.css';
import {useTableContext} from './TableView';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface InsertionIndicatorProps {
  target: ItemDropTarget,
  isPresentationOnly?: boolean
}

export default function InsertionIndicator(props: InsertionIndicatorProps) {
  let {dropState, dragAndDropHooks} = useTableContext();
  const {target, isPresentationOnly} = props;

  let ref = useRef();
  let {dropIndicatorProps} = dragAndDropHooks.useDropIndicator(props, dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  let isDropTarget = dropState.isDropTarget(target);

  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    return null;
  }
  console.log('render');


  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false"
        className={
          classNames(
            styles,
            'react-spectrum-Table-InsertionIndicator',
            {
              'react-spectrum-Table-InsertionIndicator--dropTarget': isDropTarget
            }
          )}>
        {!isPresentationOnly &&
          <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
        }
      </div>
    </div>
  );
}
