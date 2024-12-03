// @ts-nocheck
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

import {CardBase} from './CardBase';
import {CardViewContext, useCardViewContext} from './CardViewContext';
import {classNames, useDOMRef, useStyleProps, useUnwrapDOMRef} from '@react-spectrum/utils';
import {DOMRef, DOMRefValue, Node} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, ReactNode, useCallback, useMemo, useRef} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';
import {useCollator, useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListState} from '@react-stately/list';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer, VirtualizerItem} from '@react-aria/virtualizer';

/**
 * TODO: Add description of component here.
 */
export const CardView = React.forwardRef(function CardView<T extends object>(props: SpectrumCardViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {scale} = useProvider();
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let {
    isQuiet,
    renderEmptyState,
    layout,
    loadingState,
    onLoadMore,
    cardOrientation = 'vertical'
  } = props;

  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let cardViewLayout = useMemo(() => typeof layout === 'function' ? new layout({collator, cardOrientation, scale}) : layout, [layout, collator, cardOrientation, scale]);
  let layoutType = cardViewLayout.layoutType;

  let {direction} = useLocale();
  let {collection} = useListState(props);

  let gridCollection = useMemo(() => new GridCollection<T>({
    columnCount: 1,
    items: [...collection].map(item => ({
      // Makes the Grid row use the keys the user provides to the cards so that selection change via interactions returns the card keys
      ...item,
      hasChildNodes: true,
      childNodes: [{
        key: `cell-${item.key}`,
        type: 'cell',
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
    selectionMode: cardOrientation === 'horizontal' && layoutType === 'grid' ? 'none' : props.selectionMode,
    collection: gridCollection,
    focusMode: 'cell'
  });

  cardViewLayout.collection = gridCollection;
  cardViewLayout.disabledKeys = state.disabledKeys;

  let {gridProps} = useGrid({
    ...props,
    isVirtualized: true,
    keyboardDelegate: cardViewLayout
  }, state, domRef);

  type View = ReusableView<Node<T>, ReactNode>;
  let renderWrapper = useCallback((parent: View, reusableView: View) => (
    <VirtualizerItem
      key={reusableView.key}
      layoutInfo={reusableView.layoutInfo}
      virtualizer={reusableView.virtualizer}
      parent={parent?.layoutInfo}>
      {reusableView.rendered}
    </VirtualizerItem>
  ), []);

  let focusedKey = state.selectionManager.focusedKey;
  let focusedItem = gridCollection.getItem(state.selectionManager.focusedKey);
  if (focusedItem?.parentKey != null) {
    focusedKey = focusedItem.parentKey;
  }

  let persistedKeys = useMemo(() => focusedKey != null ? new Set([focusedKey]) : null, [focusedKey]);

  // TODO: does aria-row count and aria-col count need to be modified? Perhaps aria-col count needs to be omitted
  return (
    <CardViewContext.Provider value={{state, isQuiet, layout: cardViewLayout, cardOrientation, renderEmptyState}}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        className={classNames(styles, 'spectrum-CardView')}
        ref={domRef}
        persistedKeys={persistedKeys}
        scrollDirection="vertical"
        layout={cardViewLayout}
        collection={gridCollection}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        layoutOptions={useMemo(() => ({isLoading, direction}), [isLoading, direction])}
        renderWrapper={renderWrapper}
        style={{
          ...styleProps.style,
          scrollPaddingTop: cardViewLayout.margin || 0
        }}>
        {useCallback((type, item) => {
          if (type === 'item') {
            return (
              <InternalCard item={item} />
            );
          } else if (type === 'loader') {
            return <LoadingState />;
          } else if (type === 'placeholder') {
            return <EmptyState />;
          }
        }, [])}
      </Virtualizer>
    </CardViewContext.Provider>

  );
}) as <T>(props: SpectrumCardViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;

function LoadingState() {
  let {state} = useCardViewContext();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/card');
  return (
    <CenteredWrapper>
      <ProgressCircle
        isIndeterminate
        aria-label={state.collection.size > 0 ? stringFormatter.format('loadingMore') : stringFormatter.format('loading')} />
    </CenteredWrapper>
  );
}

function EmptyState() {
  let {renderEmptyState} = useCardViewContext();
  let emptyState = renderEmptyState ? renderEmptyState() : null;
  if (emptyState == null) {
    return null;
  }

  return (
    <CenteredWrapper>
      {emptyState}
    </CenteredWrapper>
  );
}

function CenteredWrapper({children}) {
  let {state} = useCardViewContext();
  return (
    <div
      role="row"
      aria-rowindex={state.collection.size + 1}
      className={classNames(styles, 'spectrum-CardView-centeredWrapper')}>
      <div role="gridcell">
        {children}
      </div>
    </div>
  );
}

function InternalCard(props) {
  let {
    item
  } = props;
  let cellNode = [...item.childNodes][0];
  let {state, cardOrientation, isQuiet, layout} = useCardViewContext();

  let layoutType = layout.layoutType;
  let rowRef = useRef(undefined);
  let cellRef = useRef<DOMRefValue<HTMLDivElement>>(undefined);
  let unwrappedRef = useUnwrapDOMRef(cellRef);

  let {rowProps: gridRowProps} = useGridRow({
    node: item,
    isVirtualized: true
  }, state, rowRef);

  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, unwrappedRef);

  // Prevent space key from scrolling the CardView if triggered on a disabled item or on a Card in a selectionMode="none" CardView.
  let allowsInteraction = state.selectionManager.selectionMode !== 'none';
  let isDisabled = !allowsInteraction || state.disabledKeys.has(item.key);

  let onKeyDown = (e) => {
    if (e.key === ' ' && isDisabled) {
      e.preventDefault();
    }
  };

  let rowProps = mergeProps(
    gridRowProps,
    {onKeyDown}
  );

  if (layoutType === 'grid' || layoutType === 'gallery') {
    isQuiet = true;
  }

  if (layoutType !== 'grid') {
    cardOrientation = 'vertical';
  }

  // We don't want to focus the checkbox (or any other focusable elements) within the Card
  // when pressing the arrow keys so we delete the key down handler here. Arrow key navigation between
  // the cards in the CardView is handled by useGrid => useSelectableCollection instead.
  delete gridCellProps.onKeyDownCapture;
  return (
    <div {...rowProps} ref={rowRef} className={classNames(styles, 'spectrum-CardView-row')}>
      <CardBase
        ref={cellRef}
        articleProps={gridCellProps}
        isQuiet={isQuiet}
        orientation={cardOrientation}
        item={item}
        layout={layoutType}>
        {item.rendered}
      </CardBase>
    </div>
  );
}
