import {ItemDropTarget} from '@react-types/shared';
import {ListViewContext} from './ListView';
import React, {useContext, useRef} from 'react';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface RowDropIndicatorProps {
  target: ItemDropTarget
}

export default function RowDropIndicator(props: RowDropIndicatorProps) {
  let {dropState, dropHooks} = useContext(ListViewContext);
  const {target} = props;

  let ref = useRef();
  let {dropIndicatorProps, isHidden} = dropHooks.useDropIndicator({target}, dropState, ref);
  let {visuallyHiddenProps} = useVisuallyHidden();

  // If isHidden, then we aren't in a drag session or this is a invalid drop target. If so we don't need to render
  // the drop indicator button.
  if (isHidden) {
    return null;
  }

  return (
    <div role="row">
      <div
        role="gridcell"
        aria-selected="false">
        <div {...visuallyHiddenProps} role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
