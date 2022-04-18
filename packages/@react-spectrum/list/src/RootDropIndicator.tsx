
import {DropHooks} from '@react-spectrum/dnd';
import type {DroppableCollectionState} from '@react-stately/dnd';
import React, {useRef} from 'react';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

interface RootDropIndicatorProps {
  dropState: DroppableCollectionState,
  dropHooks: DropHooks
}

export default function RootDropIndicator(props: RootDropIndicatorProps) {
  let {dropState, dropHooks} = props;
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
