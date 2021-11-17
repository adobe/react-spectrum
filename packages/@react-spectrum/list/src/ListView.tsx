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
import {
  AriaLabelingProps,
  CollectionBase,
  DOMProps,
  DOMRef,
  DraggableCollectionProps,
  DragItem,
  LoadingState,
  MultipleSelection,
  SpectrumSelectionProps,
  StyleProps
} from '@react-types/shared';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import DragHandle from './DragHandle';
import {GridCollection, useGridState} from '@react-stately/grid';
import {GridKeyboardDelegate, useGrid} from '@react-aria/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListLayout} from '@react-stately/layout';
import {ListState, useListState} from '@react-stately/list';
import listStyles from './listview.css';
import {ListViewItem} from './ListViewItem';
import {ProgressCircle} from '@react-spectrum/progress';
import {Provider, useProvider} from '@react-spectrum/provider';
import React, {Key, ReactElement, useContext, useMemo} from 'react';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useDraggableCollectionState} from '@react-stately/dnd';
import {Virtualizer} from '@react-aria/virtualizer';


export const ListViewContext = React.createContext(null);

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

export function useListLayout<T>(state: ListState<T>, density: ListViewProps<T>['density']) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = useMemo(() =>
      new ListLayout<T>({
        estimatedRowHeight: ROW_HEIGHTS[density][scale],
        padding: 0,
        collator
      })
    , [collator, scale, density]);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

interface ListViewProps<T> extends CollectionBase<T>, DOMProps, AriaLabelingProps, StyleProps, MultipleSelection, SpectrumSelectionProps, Omit<DraggableCollectionProps, 'getItems'> {
  /**
   * Sets the amount of vertical padding within each cell.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  isQuiet?: boolean,
  loadingState?: LoadingState,
  renderEmptyState?: () => JSX.Element,
  transitionDuration?: number,
  onAction?: (key: string) => void,
  // TODO: should this support an extra input arg for collection/state in case the user want do collection.getItem(key) in their getItems function?
  getItems?: (keys: Set<Key>) => DragItem[],
  // TODO: prop to control if the stuff inside the ListView is draggable. Perhaps should be added to DragCollection state? Or perhaps GridState should track drag stuff within it like it does selection?
  isDraggable?: boolean
}

function ListView<T extends object>(props: ListViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {
    density = 'regular',
    loadingState,
    isQuiet,
    transitionDuration = 0,
    onAction,
    getItems,
    onDragStart,
    onDragEnd,
    isDraggable = false
  } = props;
  let domRef = useDOMRef(ref);
  let {collection} = useListState(props);
  let formatMessage = useMessageFormatter(intlMessages);

  let {styleProps} = useStyleProps(props);
  let {direction} = useLocale();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let gridCollection = useMemo(() => new GridCollection({
    columnCount: 1,
    items: [...collection].map(item => ({
      ...item,
      hasChildNodes: true,
      childNodes: [{
        key: `cell-${item.key}`,
        type: 'cell',
        index: 0,
        value: null,
        level: 0,
        rendered: null,
        textValue: item.textValue,
        hasChildNodes: false,
        childNodes: []
      }]
    }))
  }), [collection]);
  let state = useGridState({
    ...props,
    collection: gridCollection,
    focusMode: 'cell',
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });
  let layout = useListLayout(state, props.density || 'regular');
  let keyboardDelegate = useMemo(() => new GridKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref: domRef,
    direction,
    collator,
    // Focus the ListView cell instead of the row so that focus doesn't change with left/right arrow keys when there aren't any
    // focusable children in the cell.
    focusMode: 'cell'
  }), [state, domRef, direction, collator]);

  let provider = useProvider();
  let dragState = useDraggableCollectionState({
    collection: state.collection,
    selectionManager: state.selectionManager,
    getItems: getItems,
    // TODO: support user provided renderPreview
    renderPreview(selectedKeys, draggedKey) {
      let item = state.collection.getItem(draggedKey);
      let itemWidth = domRef.current.offsetWidth;
      return (
        <Provider
          {...provider}
          UNSAFE_className={classNames(listStyles, 'react-spectrum-ListViewItem', 'is-dragging')}
          UNSAFE_style={{width: itemWidth}}>
          <div className={listStyles['react-spectrum-ListViewItem-grid']}>
            <div className={listStyles['react-spectrum-ListViewItem-draghandle']}>
              <DragHandle />
            </div>
            <div className={listStyles['react-spectrum-ListViewItem-content']}>
              {item.rendered}
            </div>
          </div>
        </Provider>
      );
    },
    onDragStart: onDragStart,
    onDragEnd: onDragEnd
  });

  let {gridProps} = useGrid({
    ...props,
    isVirtualized: true,
    keyboardDelegate
  }, state, domRef);

  // Sync loading state into the layout.
  layout.isLoading = loadingState === 'loading';

  let focusedKey = state.selectionManager.focusedKey;
  let focusedItem = gridCollection.getItem(state.selectionManager.focusedKey);
  if (focusedItem?.parentKey != null) {
    focusedKey = focusedItem.parentKey;
  }

  return (
    <ListViewContext.Provider value={{state, keyboardDelegate, dragState, onAction, isDraggable}}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        ref={domRef}
        focusedKey={focusedKey}
        scrollDirection="vertical"
        className={
          classNames(
            listStyles,
            'react-spectrum-ListView',
            `react-spectrum-ListView--${density}`,
            {
              'react-spectrum-ListView--quiet': isQuiet
            },
            styleProps.className
          )
        }
        layout={layout}
        collection={gridCollection}
        transitionDuration={transitionDuration}>
        {(type, item) => {
          if (type === 'item') {
            return (
              // TODO: moved most of the item props to ListViewContext since Virtualizer won't rerender w/ a memoized collection unless
              <ListViewItem item={item} />
            );
          } else if (type === 'loader') {
            return (
              <CenteredWrapper>
                <ProgressCircle
                  isIndeterminate
                  aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')} />
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
      className={classNames(listStyles, 'react-spectrum-ListView-centeredWrapper')}>
      <div role="gridcell">
        {children}
      </div>
    </div>
  );
}

const _ListView = React.forwardRef(ListView) as <T>(props: ListViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ListView as ListView};
