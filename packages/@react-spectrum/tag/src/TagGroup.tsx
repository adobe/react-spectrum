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

import {ActionButton} from '@react-spectrum/button';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {GridCollection, useGridState} from '@react-stately/grid';
import {mergeProps, useLayoutEffect, useResizeObserver, useValueEffect} from '@react-aria/utils';
import React, {ReactElement, useCallback, useMemo, useState} from 'react';
import {SpectrumTagGroupProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Tag} from './Tag';
import {TagKeyboardDelegate, useTagGroup} from '@react-aria/tag';
import {useGrid} from '@react-aria/grid';
import {useListState} from '@react-stately/list';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function TagGroup<T extends object>(props: SpectrumTagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    allowsRemoving,
    onRemove,
    maxRows,
    children,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let {direction} = useLocale();
  let listState = useListState(props);
  let gridCollection = useMemo(() => new GridCollection({
    columnCount: 1, // unused, but required for grid collections
    items: [...listState.collection].map(item => {
      let childNodes = [{
        ...item,
        index: 0,
        type: 'cell'
      }];

      return {
        type: 'item',
        childNodes
      };
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [listState.collection, allowsRemoving]);
  let state = useGridState({
    ...props,
    collection: gridCollection,
    focusMode: 'cell'
  });
  let keyboardDelegate = new TagKeyboardDelegate({
    collection: state.collection,
    disabledKeys: new Set(),
    ref: domRef,
    direction,
    focusMode: 'cell'
  });
  let {gridProps} = useGrid({
    ...props,
    keyboardDelegate
  }, state, domRef);
  const {tagGroupProps} = useTagGroup(props);

  let [isCollapsed, setIsCollapsed] = useState(maxRows != null);
  let [visibleTagCount, setVisibleTagCount] = useValueEffect(gridCollection.size);

  let updateVisibleTagCount = useCallback(() => {
    if (maxRows !== null) {
      let computeVisibleTagCount = (collapseButtonWidth?: number) => {
        // Refs can be null at runtime.
        let currDomRef: HTMLDivElement | null = domRef.current;
        if (!currDomRef) {
          return;
        }

        let tags = [...currDomRef.children].filter(el => el.tagName !== 'BUTTON');
        let currY = -Infinity;
        let rowCount = 0;
        let index = 0;
        let tagWidths = [];
        // Count rows and show tags until we hit the maxRows.
        for (let tag of tags) {
          let {y} = tag.getBoundingClientRect();

          if (y !== currY) {
            currY = y;
            rowCount++;
          }

          if (rowCount > maxRows) {
            break;
          }
          tagWidths.push(tag.getBoundingClientRect().width);
          index++;
        }

        // Remove tags until there is space for the collapse button on the last row.
        if (collapseButtonWidth) {
          let end = direction === 'ltr' ? 'right' : 'left';
          let containerEnd = currDomRef.getBoundingClientRect()[end];
          let lastTagEnd = tags[index - 1]?.getBoundingClientRect()[end];
          let availableWidth = containerEnd - lastTagEnd;
          for (let tagWidth of tagWidths.reverse()) {
            if (availableWidth > collapseButtonWidth || index <= 1) {
              break;
            }
            availableWidth += tagWidth;
            index--;
          }
        }
    
        return index;
      };
    
      setVisibleTagCount(function *() {
        // Update to show all items.
        yield gridCollection.size;

        // Measure, and update to show the items until maxRows is reached.
        let newVisibleTagCount = computeVisibleTagCount();
        yield newVisibleTagCount;
      
        if (newVisibleTagCount < gridCollection.size) {
          let collapseButtonWidth = [...domRef.current.children].find(el => el.tagName === 'BUTTON')?.getBoundingClientRect().width;
          yield computeVisibleTagCount(collapseButtonWidth);
        }
      });
    }
  }, [direction, domRef, gridCollection.size, maxRows, setVisibleTagCount]);

  useResizeObserver({ref: domRef, onResize: updateVisibleTagCount});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(updateVisibleTagCount, [children]);

  let visibleTags = [...gridCollection];
  if (maxRows != null && isCollapsed) {
    visibleTags = visibleTags.slice(0, visibleTagCount);
  }

  // Don't want the grid to be focusable or accessible via keyboard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {tabIndex, role, ...otherGridProps} = gridProps;
  return (
    <FocusScope>
      <div
        {...mergeProps(styleProps, tagGroupProps, otherGridProps)}
        className={
        classNames(
          styles,
          'spectrum-Tags',
          styleProps.className
        )
      }
        role={state.collection.size ? 'grid' : null}
        ref={domRef}>
        {visibleTags.map(item => (
          <Tag
            {...item.childNodes[0].props}
            key={item.key}
            item={item}
            state={state}
            allowsRemoving={allowsRemoving}
            onRemove={onRemove}>
            {item.childNodes[0].rendered}
          </Tag>
      ))}
        {maxRows != null && visibleTagCount < gridCollection.size &&
        <ActionButton isQuiet onPress={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? `Show all (${gridCollection.size})` : 'Show less '}
        </ActionButton>
      }
      </div>
    </FocusScope>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
const _TagGroup = React.forwardRef(TagGroup) as <T>(props: SpectrumTagGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TagGroup as TagGroup};
