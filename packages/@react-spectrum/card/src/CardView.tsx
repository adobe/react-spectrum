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
import cardViewStyles from './cardview.css';
import {classNames, useDOMRef, useStyleProps, useUnwrapDOMRef} from '@react-spectrum/utils';
import {DOMRef, DOMRefValue, Node} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useMemo, useRef} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useGrid, useGridCell, useGridRow} from '@react-aria/grid';
import {useListState} from '@react-stately/list';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer, VirtualizerItem} from '@react-aria/virtualizer';

function CardView<T extends object>(props: SpectrumCardViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {scale} = useProvider();
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let {
    isQuiet,
    renderEmptyState,
    layout,
    loadingState,
    onLoadMore
  } = props;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let cardViewLayout = useMemo(() => typeof layout === 'function' ? new layout({collator}) : layout, [layout, collator]);
  let layoutType = cardViewLayout.layoutType;

  if (typeof layout === 'function') {
    if (layoutType === 'grid') {
      cardViewLayout.itemPadding = scale === 'large' ? 116 : 95;
    } else if (layoutType === 'gallery') {
      cardViewLayout.itemPadding = scale === 'large' ? 143 : 114;
    }
  }

  let formatMessage = useMessageFormatter(intlMessages);
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
    collection: gridCollection,
    focusMode: 'cell'
  });

  cardViewLayout.collection = gridCollection;
  cardViewLayout.disabledKeys = state.disabledKeys;
  cardViewLayout.isLoading = isLoading;
  cardViewLayout.direction = direction;

  let {gridProps} = useGrid({
    ...props,
    isVirtualized: true,
    keyboardDelegate: cardViewLayout
  }, state, domRef);

  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View) => (
    <VirtualizerItem
      className={classNames(cardViewStyles, 'react-spectrum-CardView-CardWrapper')}
      key={reusableView.key}
      reusableView={reusableView}
      parent={parent} />
  );

  let focusedKey = state.selectionManager.focusedKey;
  let focusedItem = gridCollection.getItem(state.selectionManager.focusedKey);
  if (focusedItem?.parentKey != null) {
    focusedKey = focusedItem.parentKey;
  }

  // TODO: does aria-row count and aria-col count need to be modified? Perhaps aria-col count needs to be omitted
  return (
    <CardViewContext.Provider value={{state, isQuiet, layout: cardViewLayout}}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        className={classNames(cardViewStyles, 'react-spectrum-CardView')}
        ref={domRef}
        focusedKey={focusedKey}
        scrollDirection="vertical"
        layout={cardViewLayout}
        collection={gridCollection}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        renderWrapper={renderWrapper}>
        {(type, item) => {
          if (type === 'item') {
            return (
              <InternalCard item={item} />
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
        }}
      </Virtualizer>
    </CardViewContext.Provider>

  );
}

function CenteredWrapper({children}) {
  let {state} = useCardViewContext();
  return (
    <div
      role="row"
      aria-rowindex={state.collection.size + 1}
      className={classNames(cardViewStyles, 'react-spectrum-CardView-centeredWrapper')}>
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
  let rowRef = useRef();
  let cellRef = useRef<DOMRefValue<HTMLDivElement>>();
  let unwrappedRef = useUnwrapDOMRef(cellRef);

  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true
  }, state, rowRef);

  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, unwrappedRef);


  if (layoutType === 'grid' || layoutType === 'gallery') {
    isQuiet = true;
  }

  return (
    <div {...rowProps} ref={rowRef} style={{height: '100%'}}>
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

/**
 * TODO: Add description of component here.
 */
const _CardView = React.forwardRef(CardView) as <T>(props: SpectrumCardViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_CardView as CardView};
