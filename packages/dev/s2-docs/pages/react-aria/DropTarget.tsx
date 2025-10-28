"use client";

import React, {JSX} from 'react';
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
          .map(async item => {
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

  let message: JSX.Element[] = [<div>{`Drop here`}</div>];
  if (dropped) {
    message = dropped.map((d, index) => {
      let m = d.message;
      if (d.style === 'bold') {
        message = [<strong>{m}</strong>];
      } else if (d.style === 'italic') {
        message = [<em>{m}</em>];
      }
      return <div key={index}>{message}</div>;
    });
  }

  return (
    <div {...dropProps} role="button" tabIndex={0} ref={ref} className={`droppable ${isDropTarget ? 'target' : ''}`}>
      {message}
    </div>
  );
}