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

import {baseColor, fontRelative, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {controlFont} from './style-utils' with {type: 'macro'};
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import {DragItem} from '@react-types/shared';
import {IconContext} from './Icon';
import {ReactNode} from 'react';
import {Text, TextContext} from './Content';
import {useScale} from './utils';

export let label = style({
  gridArea: 'label',
  alignSelf: 'center',
  font: controlFont(),
  color: 'inherit',
  truncate: true,
  whiteSpace: {
    default: 'nowrap',
    overflowMode: {
      wrap: 'normal'
    }
  }
});

export let description = style({
  gridArea: 'description',
  alignSelf: 'center',
  truncate: true,
  whiteSpace: {
    default: 'nowrap',
    overflowMode: {
      wrap: 'normal'
    }
  },
  font: 'ui-sm',
  color: {
    default: baseColor('neutral-subdued'),
    isDisabled: 'disabled',
    forcedColors: 'inherit'
  },
  transition: 'default'
});

export let iconCenterWrapper = style({
  display: 'flex',
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  alignItems: 'center'
});

export let icon = style({
  display: 'block',
  size: fontRelative(20),
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export let dragPreviewWrapper = style({
  position: 'relative'
});

export let dragPreviewCardBack = style({
  position: 'absolute',
  zIndex: -1,
  top: 4,
  left: 4,
  width: 200,
  height: 'full',
  borderRadius: 'default',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'blue-900',
  backgroundColor: 'gray-25'
});

export let dragPreviewCard = style<{scale?: 'medium' | 'large'}>({
  boxSizing: 'border-box',
  paddingX: 0,
  paddingY: 8,
  backgroundColor: 'gray-25',
  color: baseColor('neutral'),
  position: 'relative',
  display: 'grid',
  gridTemplateAreas: ['. icon label       . badge .', '. .    description . badge .'],
  gridTemplateColumns: [12, 'auto', 'minmax(0, 1fr)', 4, 'auto', 6],
  gridTemplateRows: '1fr auto',
  alignItems: 'baseline',
  minHeight: {
    default: 40,
    scale: {
      large: 50
    }
  },
  width: 200,
  borderRadius: 'default',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'blue-900'
});

export let dragPreviewBadge = style({
  gridArea: 'badge',
  alignSelf: 'center',
  paddingX: 8,
  paddingY: 2,
  borderRadius: 'sm',
  backgroundColor: {
    default: 'blue-900',
    forcedColors: 'Highlight'
  },
  font: 'ui-sm',
  fontWeight: 'bold',
  color: {
    default: 'white',
    forcedColors: 'HighlightText'
  },
  forcedColorAdjust: 'none'
});

export interface DragPreviewProps {
  /** The currently dragged items, sourced from renderDragPreview. */
  items: DragItem[];
  /** The overflow mode to be applied on the drag preview. */
  overflowMode?: 'wrap' | 'truncate';
  /**
   * The contents of the drag preview. Supports the `label`, `description`, and `icon` slots.
   * If no children are provided, defaults to the first drag item's plain text content.
   */
  children?: ReactNode;
}

/**
 * The default drag preview rendered by the collection element during drag and drop. Pass this to
 * your drag hooks' `renderDragPreview` to match the default visual. To customize the drag preview's
 * contents, use Text with the "label" and "description" slots and/or a Icon for the leading icon.
 */
export function DragPreview(props: DragPreviewProps) {
  let {items, overflowMode} = props;
  let isDraggingMultiple = items.length > 1;
  let itemLabel = items[0]?.['text/plain'] ?? '';
  let scale = useScale();

  return (
    <div className={dragPreviewWrapper}>
      {isDraggingMultiple && <div className={dragPreviewCardBack} />}
      <div className={dragPreviewCard({scale})}>
        <Provider
          values={[
            [
              TextContext,
              {
                slots: {
                  [DEFAULT_SLOT]: {styles: label({overflowMode})},
                  label: {styles: label({overflowMode})},
                  description: {styles: description({overflowMode})}
                }
              }
            ],
            [
              IconContext,
              {
                slots: {
                  icon: {
                    render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}),
                    styles: icon
                  }
                }
              }
            ]
          ]}>
          {props.children ?? <Text>{itemLabel}</Text>}
          {isDraggingMultiple && <div className={dragPreviewBadge}>{items.length}</div>}
        </Provider>
      </div>
    </div>
  );
}
