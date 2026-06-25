/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Direction} from '@react-types/shared';
import {getColumnHorizontalStyle} from 'react-stately/useTableState';
import {LayoutInfo} from 'react-stately/useVirtualizerState';
import React, {CSSProperties, JSX, ReactNode, useRef} from 'react';
import {useLocale} from '../i18n/I18nProvider';
import {useVirtualizerItem, VirtualizerItemOptions} from './useVirtualizerItem';

interface VirtualizerItemProps extends Omit<VirtualizerItemOptions, 'ref'> {
  layoutInfo: LayoutInfo;
  parent?: LayoutInfo | null;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
  /** When true, horizontal positioning uses CSS custom properties instead of inline styles. */
  useColumnCSSVariables?: boolean;
  columnIndex?: number;
  colSpan?: number;
}

export function VirtualizerItem(props: VirtualizerItemProps): JSX.Element {
  let {
    style,
    className,
    layoutInfo,
    virtualizer,
    parent,
    children,
    useColumnCSSVariables,
    columnIndex,
    colSpan
  } = props;
  let {direction} = useLocale();
  let ref = useRef<HTMLDivElement | null>(null);
  useVirtualizerItem({
    layoutInfo,
    virtualizer,
    ref
  });

  let columnStyle =
    useColumnCSSVariables && columnIndex != null
      ? getColumnHorizontalStyle(columnIndex, colSpan ?? 1)
      : undefined;

  return (
    <div
      role="presentation"
      ref={ref}
      className={className}
      data-column-index={columnIndex}
      style={{
        ...layoutInfoToStyle(layoutInfo, direction, parent, useColumnCSSVariables),
        ...columnStyle,
        ...style
      }}>
      {children}
    </div>
  );
}

let cache = new WeakMap();
export function layoutInfoToStyle(
  layoutInfo: LayoutInfo,
  dir: Direction,
  parent?: LayoutInfo | null,
  useColumnCSSVariables?: boolean
): CSSProperties {
  let usesColumnCSSVars =
    useColumnCSSVariables && (layoutInfo.type === 'column' || layoutInfo.type === 'cell');
  let xProperty = dir === 'rtl' ? 'right' : 'left';
  let cached = cache.get(layoutInfo);
  if (cached && cached[xProperty] != null) {
    if (!parent) {
      return cached;
    }

    // Invalidate if the parent position changed.
    let top = layoutInfo.rect.y - parent.rect.y;
    let x = usesColumnCSSVars ? undefined : layoutInfo.rect.x - parent.rect.x;
    if (cached.top === top && (usesColumnCSSVars || cached[xProperty] === x)) {
      return cached;
    }
  }

  let rectStyles: Record<string, number | undefined> = {
    // TODO: For layoutInfos that are sticky that have parents with overflow visible, their "top" will be relative to the to the nearest scrolling container
    // which WON'T be the parent since the parent has overflow visible. This means we shouldn't offset the height by the parent's position
    // Not 100% about this change here since it is quite ambigious what the scrolling container maybe and how its top is positioned with respect to the
    // calculated layoutInfo.y here
    top:
      layoutInfo.rect.y -
      (parent && !(parent.allowOverflow && layoutInfo.isSticky) ? parent.rect.y : 0),
    height: layoutInfo.rect.height
  };

  if (!usesColumnCSSVars) {
    rectStyles[xProperty] =
      layoutInfo.rect.x -
      (parent && !(parent.allowOverflow && layoutInfo.isSticky) ? parent.rect.x : 0);
    rectStyles.width = layoutInfo.rect.width;
  }

  // Get rid of any non finite values since they aren't valid css values
  Object.entries(rectStyles).forEach(([key, value]) => {
    if (!Number.isFinite(value)) {
      rectStyles[key] = undefined;
    }
  });

  let style: CSSProperties = {
    position: layoutInfo.isSticky ? 'sticky' : 'absolute',
    // Sticky elements are positioned in normal document flow. Display inline-block so that they don't push other sticky columns onto the following rows.
    display: layoutInfo.isSticky ? 'inline-block' : undefined,
    overflow: layoutInfo.allowOverflow ? 'visible' : 'hidden',
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform ?? undefined,
    contain: usesColumnCSSVars ? 'layout style' : 'size layout style',
    ...rectStyles
  };

  cache.set(layoutInfo, style);
  return style;
}
