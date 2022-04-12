import {classNames} from '@react-spectrum/utils';
import listStyles from './listview.css';
import React, {useRef} from 'react';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface InsertionIndicatorProps {
  target,
  dropState,
  dropHooks
}

export default function InsertionIndicator(props: InsertionIndicatorProps) {
  const {dropHooks, dropState, target} = props;
  let ref = useRef();
  let {dropIndicatorProps} = dropHooks.useDropIndicator(props, dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  let isDropTarget = dropState.isDropTarget(target);
  console.log(dropState);

  // If aria-hidden, we are either not in a drag session or the drop target is invalid.
  // In that case, there's no need to render anything at all unless we need to show the indicator visually.
  // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
  if (!isDropTarget && dropIndicatorProps['aria-hidden']) {
    // return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false"
        className={classNames(listStyles, 'react-spectrum-ListViewInsertionIndicator')}>
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
