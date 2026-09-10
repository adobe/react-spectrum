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

import {AriaLabelingProps, DOMProps, DOMRef, forwardRefType} from '@react-types/shared';
import {
  AttachmentCard,
  AttachmentPreviewContext,
  AttachmentRenderProps,
  isAttachmentLoading
} from './AttachmentList';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {forwardRef, ReactNode} from 'react';
import {ListBox, ListBoxItem, ListBoxItemProps, ListBoxProps} from 'react-aria-components/ListBox';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {scrollFade} from './tokens.macro' with {type: 'macro'};
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';

export interface AttachmentGridProps<T>
  extends
    DOMProps,
    AriaLabelingProps,
    Pick<ListBoxProps<T>, 'items' | 'children' | 'dependencies'> {
  /**
   * The alignment of attachments within the grid.
   *
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

// Grid items are expected to be either all thumbnails or cards and the same size.
const hasContent = ':has([data-slot=content])';

const gridStyles = style({
  display: {
    default: 'flex',
    [hasContent]: 'grid'
  },
  flexWrap: 'wrap',
  alignItems: 'start',
  gridTemplateColumns: {
    [hasContent]: 'repeat(auto-fill, minmax(240px, 1fr))'
  },
  justifyContent: {
    align: {
      start: 'normal',
      center: 'center',
      end: 'end'
    }
  },
  gap: 8,
  maxHeight: 240,
  overflowY: 'auto',
  overflowX: 'clip',
  boxSizing: 'border-box',
  ...focusRing()
});

/**
 * An AttachmentGrid displays file attachments as a wrapping, vertically-scrolling grid of
 * thumbnails. Unlike AttachmentList, it is display-only and does not support selection or removal.
 * Every attachment is disabled, so the grid itself becomes the sole tab stop, keeping the
 * overflow area keyboard-scrollable without letting individual attachments be focused or actioned.
 */
export const AttachmentGrid = (forwardRef as forwardRefType)(function AttachmentGrid<T>(
  props: AttachmentGridProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {styles, items, children, dependencies, align = 'start', ...otherProps} = props;
  let domRef = useDOMRef(ref);

  return (
    <ListBox
      {...otherProps}
      layout="grid"
      items={items}
      dependencies={dependencies}
      ref={domRef}
      className={renderProps =>
        mergeStyles(gridStyles({...renderProps, align}), styles) + ' ' + scrollFade({y: 36})
      }>
      {children}
    </ListBox>
  );
});

export interface AttachmentGridItemProps
  extends AriaLabelingProps, Pick<ListBoxItemProps, 'id' | 'textValue'> {
  /** The size of the Card. */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  /** Whether the attachment has an error. */
  isInvalid?: boolean;
  uploadProgress?: number;
  /** The children of the AttachmentGridItem. */
  children: ReactNode | ((renderProps: AttachmentRenderProps) => ReactNode);
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const itemStyles = style({
  flexShrink: 0,
  flexGrow: 0,
  position: 'relative',
  borderRadius: 'lg'
});

/**
 * AttachmentGridItem displays an individual file attachment thumbnail within an AttachmentGrid.
 */
export const AttachmentGridItem = forwardRef(function AttachmentGridItem(
  props: AttachmentGridItemProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {id, textValue, styles, isInvalid, size = 'M', children, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let isLoading = isAttachmentLoading(props.uploadProgress);

  return (
    <ListBoxItem
      id={id}
      {...filterDOMProps(otherProps, {labelable: true})}
      textValue={textValue}
      isDisabled
      ref={domRef}
      className={mergeStyles(itemStyles, styles)}>
      <AttachmentCard size={size} isInvalid={isInvalid} isLoading={isLoading}>
        <AttachmentPreviewContext.Provider
          value={{isInvalid: !!isInvalid, uploadProgress: props.uploadProgress ?? 100, size}}>
          {typeof children === 'function' ? children({size}) : children}
        </AttachmentPreviewContext.Provider>
      </AttachmentCard>
    </ListBoxItem>
  );
});
