/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DragAndDropContext, DropIndicator} from 'react-aria-components/useDragAndDrop';
import {ItemDropTarget} from '@react-types/shared';
import React, {useContext} from 'react';
import {style} from '../style' with {type: 'macro'};

let insertionIndicatorWrapper = style<{isDropTarget?: boolean; isRoot?: boolean}>({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  marginStart: {
    default: 'calc((var(--drop-level, 1) - 1) * var(--indent) + var(--indicator-level-padding))',
    isRoot: 0
  },
  color: {
    default: 'transparent',
    isDropTarget: 'blue-800',
    forcedColors: {
      isDropTarget: 'Highlight'
    }
  },
  '--indicator-circle-bg': {
    type: 'backgroundColor',
    value: {
      default: 'transparent',
      isDropTarget: 'gray-25',
      forcedColors: {
        isDropTarget: 'Background'
      }
    }
  },
  forcedColorAdjust: 'none'
});

export function InsertionIndicator({target}: {target: ItemDropTarget}) {
  let {dropState} = useContext(DragAndDropContext) ?? {};
  let level = 0;
  if (target.type === 'item' && dropState?.collection) {
    level = dropState.collection.getItem(target.key)?.level ?? 0;
  }
  return (
    <DropIndicator className="" target={target}>
      {({isDropTarget}) => (
        <div
          className={insertionIndicatorWrapper({isDropTarget, isRoot: level === 0})}
          style={level > 0 ? ({'--drop-level': level} as React.CSSProperties) : undefined}>
          <svg aria-hidden width="100%" height="12">
            <line x1="0" y1="6" x2="100%" y2="6" strokeWidth="2" stroke="currentColor" />
            <circle
              cx="6"
              cy="6"
              r="5"
              strokeWidth="2"
              stroke="currentColor"
              style={{fill: 'var(--indicator-circle-bg)'}}
            />
            <circle
              cx="100%"
              cy="6"
              r="5"
              strokeWidth="2"
              stroke="currentColor"
              style={{fill: 'var(--indicator-circle-bg)'}}
              transform="translate(-6, 0)"
            />
          </svg>
        </div>
      )}
    </DropIndicator>
  );
}
