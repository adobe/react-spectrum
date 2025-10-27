"use client";

import React from 'react';
import type {TextDropItem} from '@react-aria/dnd';
import {useDrop} from '@react-aria/dnd';

export function DropTarget() {
  let [dropped, setDropped] = React.useState(null);
  let ref = React.useRef(null);
  let {dropProps, isDropTarget} = useDrop({
    ref,
    async onDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(item => item.kind === 'text' && (item.types.has('text/plain') || item.types.has('my-app-custom-type')))
          .map(async (item: TextDropItem) => {
            if (item.types.has('my-app-custom-type')) {
              return JSON.parse(await item.getText('my-app-custom-type'));
            } else {
              return {message: await item.getText('text/plain')};
            }
          })
      );
      setDropped(items);
    }
  });

  let message: string[] = ['Drop here'];
  if (dropped) {
    message = dropped.map(d => {
      let message = d.message;
      if (d.style === 'bold') {
        message = <strong>{message}</strong>;
      } else if (d.style === 'italic') {
        message = <em>{message}</em>;
      }
      return <div>{message}</div>;
    });
  }

  return (
    <div {...dropProps} role="button" tabIndex={0} ref={ref} className={`droppable ${isDropTarget ? 'target' : ''}`}>
      {message}
    </div>
  );
}