"use client";
import React from 'react';
import {useDrag} from '@react-aria/dnd';

export function Draggable() {
  let {dragProps, isDragging} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world',
        'my-app-custom-type': JSON.stringify({message: 'hello world'})
      }];
    }
  });

  return (
    <div {...dragProps} role="button" tabIndex={0} className={`draggable ${isDragging ? 'dragging' : ''}`}>
      Drag me
    </div>
  );
}