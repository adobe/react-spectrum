import {ListViewContext} from './ListView';
import React, {useContext, useRef} from 'react';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export default function RootDropIndicator() {
  let {dropState, dropHooks} = useContext(ListViewContext);
  let dropRef = useRef();
  let {dropIndicatorProps} = dropHooks.useDropIndicator({
    target: {type: 'root'}
  }, dropState, dropRef);

  let {visuallyHiddenProps} = useVisuallyHidden();
  if (dropIndicatorProps['aria-hidden']) {
    return null;
  }

  return (
    <div
      role="option"
      aria-selected="false"
      {...visuallyHiddenProps}
      {...dropIndicatorProps}
      ref={dropRef} />
  );
}
