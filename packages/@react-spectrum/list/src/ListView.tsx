/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, LoadingState} from '@react-types/shared';
import type {DraggableCollectionState, DroppableCollectionState} from '@react-stately/dnd';
import {DragHooks, DropHooks} from '@react-spectrum/dnd';
import {DragPreview} from './DragPreview';
import type {DroppableCollectionResult} from '@react-aria/dnd';
import {filterDOMProps, useLayoutEffect} from '@react-aria/utils';
import InsertionIndicator from './InsertionIndicator';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListLayout} from '@react-stately/layout';
import {ListState, useListState} from '@react-stately/list';
import listStyles from './styles.css';
import {ListViewItem} from './ListViewItem';
import {mergeProps} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {Key, ReactElement, useContext, useMemo, useRef, useState} from 'react';
import {Rect} from '@react-stately/virtualizer';
import RootDropIndicator from './RootDropIndicator';
import {SpectrumListProps} from '@react-types/list';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useList} from '@react-aria/list';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer} from '@react-aria/virtualizer';

interface ListViewContextValue<T> {
  state: ListState<T>,
  dragState: DraggableCollectionState,
  dropState: DroppableCollectionState,
  dragHooks: DragHooks,
  dropHooks: DropHooks,
  onAction:(key: Key) => void,
  isListDraggable: boolean,
  isListDroppable: boolean,
  layout: ListLayout<T>,
  loadingState: LoadingState
}

export const ListViewContext = React.createContext<ListViewContextValue<unknown>>(null);

const ROW_HEIGHTS = {
  compact: {
    medium: 32,
    large: 40
  },
  regular: {
    medium: 40,
    large: 50
  },
  spacious: {
    medium: 48,
    large: 60
  }
};

function useListLayout<T>(state: ListState<T>, density: SpectrumListProps<T>['density']) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let isEmpty = state.collection.size === 0;
  let layout = useMemo(() =>
    new ListLayout<T>({
      estimatedRowHeight: ROW_HEIGHTS[density][scale],
      padding: 0,
      collator,
      loaderHeight: isEmpty ? null : ROW_HEIGHTS[density][scale],
      allowDisabledKeyFocus: true
    })
    , [collator, scale, density, isEmpty]);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

function ListView<T extends object>(props: SpectrumListProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {
    density = 'regular',
    onLoadMore,
    loadingState,
    isQuiet,
    overflowMode = 'truncate',
    onAction,
    dragHooks,
    dropHooks,
    ...otherProps
  } = props;
  let isListDraggable = !!dragHooks;
  let isListDroppable = !!dropHooks;
  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  if (dragHooksProvided.current !== isListDraggable) {
    console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  if (dropHooksProvided.current !== isListDroppable) {
    console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  let domRef = useDOMRef(ref);
  let state = useListState({
    ...props,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });
  let {collection, selectionManager} = state;
  let formatMessage = useMessageFormatter(intlMessages);
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';

  let {styleProps} = useStyleProps(props);
  let {locale} = useLocale();
  let layout = useListLayout(state, props.density || 'regular');
  let provider = useProvider();
  let dragState: DraggableCollectionState;
  if (isListDraggable) {
    dragState = dragHooks.useDraggableCollectionState({
      collection,
      selectionManager,
      renderPreview(draggingKeys, draggedKey) {
        let item = collection.getItem(draggedKey);
        let itemCount = draggingKeys.size;
        let itemHeight = layout.getLayoutInfo(draggedKey).rect.height;
        return <DragPreview item={item} itemCount={itemCount} itemHeight={itemHeight} provider={provider} locale={locale}  />;
      }
    });
  }

  let dropState: DroppableCollectionState;
  let droppableCollection: DroppableCollectionResult;
  let isRootDropTarget: boolean;
  if (isListDroppable) {
    dropState = dropHooks.useDroppableCollectionState({
      collection,
      selectionManager
    });
    droppableCollection = dropHooks.useDroppableCollection({
      keyboardDelegate: layout,
      getDropTargetFromPoint(x, y) {
        let closest = null;
        let closestDistance = Infinity;
        let closestDir = null;

        x += domRef.current.scrollLeft;
        y += domRef.current.scrollTop;

        let visible = layout.getVisibleLayoutInfos(new Rect(x - 50, y - 50, x + 50, y + 50));

        for (let layoutInfo of visible) {
          let r = layoutInfo.rect;
          let points: [number, number, string][] = [
            [r.x, r.y + 4, 'before'],
            [r.maxX, r.y + 4, 'before'],
            [r.x, r.maxY - 8, 'after'],
            [r.maxX, r.maxY - 8, 'after']
          ];

          for (let [px, py, dir] of points) {
            let dx = px - x;
            let dy = py - y;
            let d = dx * dx + dy * dy;
            if (d < closestDistance) {
              closestDistance = d;
              closest = layoutInfo;
              closestDir = dir;
            }
          }

          // TODO: Best way to implement only for when closest can be dropped on
          // TODO: Figure out the typescript for this
          // @ts-ignore
          if (y >= r.y + 10 && y <= r.maxY - 10 && collection.getItem(closest.key).value.type === 'folder') {
            closestDir = 'on';
          }
        }

        let key = closest?.key;
        if (key) {
          return {
            type: 'item',
            key,
            dropPosition: closestDir
          };
        }
      }
    }, dropState, domRef);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {gridProps} = useList({
    ...props,
    isVirtualized: true,
    keyboardDelegate: layout,
    onAction
  }, state, domRef);

  // Sync loading state into the layout.
  layout.isLoading = isLoading;

  let focusedKey = selectionManager.focusedKey;
  if (dropState?.target?.type === 'item') {
    focusedKey = dropState.target.key;
  }

  // wait for layout to get accurate measurements
  let [isVerticalScrollbarVisible, setVerticalScollbarVisible] = useState(false);
  let [isHorizontalScrollbarVisible, setHorizontalScollbarVisible] = useState(false);
  useLayoutEffect(() => {
    if (domRef.current) {
      // 2 is the width of the border which is not part of the box size
      setVerticalScollbarVisible(domRef.current.clientWidth + 2 < domRef.current.offsetWidth);
      setHorizontalScollbarVisible(domRef.current.clientHeight + 2 < domRef.current.offsetHeight);
    }
  });

  let hasAnyChildren = useMemo(() => [...collection].some(item => item.hasChildNodes), [collection]);

  return (
    <ListViewContext.Provider value={{state, dragState, dropState, dragHooks, dropHooks, onAction, isListDraggable, isListDroppable, layout, loadingState}}>
      <Virtualizer
        {...mergeProps(isListDroppable && droppableCollection?.collectionProps, gridProps)}
        {...filterDOMProps(otherProps)}
        {...gridProps}
        {...styleProps}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        ref={domRef}
        focusedKey={focusedKey}
        scrollDirection="vertical"
        className={
          classNames(
            listStyles,
            'react-spectrum-ListView',
            `react-spectrum-ListView--${density}`,
            'react-spectrum-ListView--emphasized',
            {
              'react-spectrum-ListView--quiet': isQuiet,
              'react-spectrum-ListView--loadingMore': loadingState === 'loadingMore',
              'react-spectrum-ListView--draggable': !!isListDraggable,
              'react-spectrum-ListView--dropTarget': !!isRootDropTarget,
              'react-spectrum-ListView--isVerticalScrollbarVisible': isVerticalScrollbarVisible,
              'react-spectrum-ListView--isHorizontalScrollbarVisible': isHorizontalScrollbarVisible,
              'react-spectrum-ListView--hasAnyChildren': hasAnyChildren,
              'react-spectrum-ListView--wrap': overflowMode === 'wrap'
            },
            styleProps.className
          )
        }
        layout={layout}
        collection={collection}
        transitionDuration={isLoading ? 160 : 220}>
        {(type, item) => {
          if (type === 'item') {
            return (
              <>
                {isListDroppable && collection.getKeyBefore(item.key) == null &&
                  <RootDropIndicator key="root" />
                }
                {isListDroppable &&
                  <InsertionIndicator
                    key={`${item.key}-before`}
                    target={{key: item.key, type: 'item', dropPosition: 'before'}} />
                }
                <ListViewItem item={item} isEmphasized hasActions={!!onAction} />
                {isListDroppable &&
                  <InsertionIndicator
                    key={`${item.key}-after`}
                    target={{key: item.key, type: 'item', dropPosition: 'after'}}
                    isPresentationOnly={collection.getKeyAfter(item.key) !== null} />
                  }
              </>
            );
          } else if (type === 'loader') {
            return (
              <CenteredWrapper>
                <ProgressCircle
                  isIndeterminate
                  aria-label={collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')} />
              </CenteredWrapper>
            );
          } else if (type === 'placeholder') {
            let emptyState = props.renderEmptyState ? props.renderEmptyState() : null;
            if (emptyState == null) {
              return null;
            }

            return (
              <CenteredWrapper>
                {emptyState}
              </CenteredWrapper>
            );
          }

        }}
      </Virtualizer>
    </ListViewContext.Provider>
  );
}

function CenteredWrapper({children}) {
  let {state} = useContext(ListViewContext);
  return (
    <div
      role="row"
      aria-rowindex={state.collection.size + 1}
      className={
        classNames(
          listStyles,
          'react-spectrum-ListView-centeredWrapper',
          {
            'react-spectrum-ListView-centeredWrapper--loadingMore': state.collection.size > 0
          }
        )}>
      <div role="gridcell">
        {children}
      </div>
    </div>
  );
}

/**
 * Lists display a linear collection of data. They allow users to quickly scan, sort, compare, and take action on large amounts of data.
 */
const _ListView = React.forwardRef(ListView) as <T>(props: SpectrumListProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ListView as ListView};
