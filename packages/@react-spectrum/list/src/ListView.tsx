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
import {DOMRef} from '@react-types/shared';
import type {DraggableCollectionState} from '@react-stately/dnd';
import {DragPreview} from './DragPreview';
import {filterDOMProps} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListLayout} from '@react-stately/layout';
import {ListState, useListState} from '@react-stately/list';
import listStyles from './listview.css';
import {ListViewItem} from './ListViewItem';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useContext, useMemo, useRef} from 'react';
import {SpectrumListProps} from '@react-types/list';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useList} from '@react-aria/list';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer} from '@react-aria/virtualizer';

interface ListViewContextValue<T> {
  state: ListState<T>,
  dragState: DraggableCollectionState,
  isListDraggable: boolean,
  layout: ListLayout<T>
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

export function useListLayout<T>(state: ListState<T>, density: SpectrumListProps<T>['density']) {
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
    onAction,
    dragHooks,
    ...otherProps
  } = props;
  let isListDraggable = !!dragHooks;
  let dragHooksProvided = useRef(isListDraggable);
  if (dragHooksProvided.current !== isListDraggable) {
    console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  let domRef = useDOMRef(ref);
  let state = useListState({
    ...props,
    selectionBehavior: props.selectionStyle === 'highlight' ? 'replace' : 'toggle'
  });
  let formatMessage = useMessageFormatter(intlMessages);
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';

  let {styleProps} = useStyleProps(props);
  let {locale} = useLocale();
  let layout = useListLayout(state, props.density || 'regular');
  let provider = useProvider();
  let dragState: DraggableCollectionState;
  if (isListDraggable) {
    dragState = dragHooks.useDraggableCollectionState({
      collection: state.collection,
      selectionManager: state.selectionManager,
      renderPreview(draggingKeys, draggedKey) {
        let item = state.collection.getItem(draggedKey);
        let itemCount = draggingKeys.size;
        let itemHeight = layout.getLayoutInfo(draggedKey).rect.height;
        return <DragPreview item={item} itemCount={itemCount} itemHeight={itemHeight} provider={provider} locale={locale}  />;
      }
    });
  }

  let {gridProps} = useList({
    ...props,
    isVirtualized: true,
    keyboardDelegate: layout,
    onAction
  }, state, domRef);

  // Sync loading state into the layout.
  layout.isLoading = isLoading;
  return (
    <ListViewContext.Provider value={{state, dragState, isListDraggable, layout}}>
      <Virtualizer
        {...filterDOMProps(otherProps)}
        {...gridProps}
        {...styleProps}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        ref={domRef}
        focusedKey={state.selectionManager.focusedKey}
        scrollDirection="vertical"
        className={
          classNames(
            listStyles,
            'react-spectrum-ListView',
            `react-spectrum-ListView--${density}`,
            'react-spectrum-ListView--emphasized',
            {
              'react-spectrum-ListView--quiet': isQuiet,
              'react-spectrum-ListView--draggable': isListDraggable,
              'react-spectrum-ListView--loadingMore': loadingState === 'loadingMore'
            },
            styleProps.className
          )
        }
        layout={layout}
        collection={state.collection}
        transitionDuration={isLoading ? 160 : 220}>
        {(type, item) => {
          if (type === 'item') {
            return (
              <ListViewItem item={item} isEmphasized dragHooks={dragHooks} hasActions={!!onAction}  />
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
