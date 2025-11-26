"use client";

import React, {JSX, ReactNode} from 'react';
import type {TextDropItem} from '@react-aria/dnd';
import {useDrop} from '@react-aria/dnd';

interface DroppedItem {
  message: string;
  style?: 'bold' | 'italic';
}

export function DropTarget() {
  let [dropped, setDropped] = React.useState<DroppedItem[] | null>(null);
  let ref = React.useRef(null);
  let {dropProps, isDropTarget} = useDrop({
    ref,
    async onDrop(e) {
      let items = await Promise.all(
        (e.items as TextDropItem[])
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

  let message: ReactNode = <div key="drop here">'Drop here'</div>;
  if (dropped) {
    message = dropped.map((d, index) => {
      let m: ReactNode = d.message;
      if (d.style === 'bold') {
        m = <strong key={index}>{m}</strong>;
      } else if (d.style === 'italic') {
        m = <em key={index}>{m}</em>;
      }
      return <div key={index}>{m}</div>;
    });
  }

  return (
    <div {...dropProps} role="button" tabIndex={0} ref={ref} className={`droppable ${isDropTarget ? 'target' : ''}`}>
      {message}
    </div>
  );
}