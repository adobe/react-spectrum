import {ListViewContext} from './ListView';
import React, {useContext, useRef} from 'react';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export default function RootDropIndicator() {
  let {dropState, dropHooks} = useContext(ListViewContext);
  let ref = useRef();
  let {dropIndicatorProps} = dropHooks.useDropIndicator({
    target: {type: 'root'}
  }, dropState, ref);

  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div role="row" aria-hidden={dropIndicatorProps['aria-hidden']}>
      <div
        role="gridcell"
        aria-selected="false"
        {...visuallyHiddenProps}>
        <div role="button" {...dropIndicatorProps} ref={ref} />
      </div>
    </div>
  );
}
