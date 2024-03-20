import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import React from 'react';
import {style} from '@react-spectrum/rainbow/style' with { type: 'macro' };

export function Draggable() {
  let {dragProps} = useDrag({
    getItems() {
      return [{
        'text/plain': 'Drag and dropped'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    }
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'Copy and paste'
      }];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing >
      <div
        className={style({
          color: 'gray-900',
          padding: 8,
          borderColor: 'gray-900',
          borderWidth: 2,
          borderStyle: 'solid',
          fontFamily: 'sans'
        })}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}
