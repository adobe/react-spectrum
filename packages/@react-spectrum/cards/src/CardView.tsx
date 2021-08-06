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

import cardViewStyles from './cardview.css';
import {classNames, useDOMRef, useUnwrapDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ReactElement, useContext, useMemo, useRef} from 'react';
import {SpectrumCardViewProps} from '@react-types/cards';
import {useGrid} from '@react-aria/grid';
import {useListState} from '@react-stately/list';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';
import {Virtualizer} from '@react-aria/virtualizer';

export const CardViewContext = React.createContext(null);

function CardView<T extends object>(props: SpectrumCardViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let {
    cardOrientation,
    cardSize,
    isQuiet,
    renderEmptyState,
    layout,
    isLoading,
    onLoadMore
  } = props;

  let cardViewLayout = useMemo(() => typeof layout === 'function' ? new layout({cardSize, cardOrientation}) : layout, [layout, cardSize, cardOrientation]);

  // TODO:
  // What exactly is the layout of CardView going to be? Is it a single column Grid with each row having child Card elements?
  // Or is it a multi column grid with each Card being a Cell in the Row?
  // " Each card is represented as a row in the grid with a single cell inside." Does this mean you have rows next to each other? Feels weird, check v2 implementation


  // TODO: Don't think we need collator here, CardView won't support typeahead right?
  let formatMessage = useMessageFormatter(intlMessages);
  let {direction} = useLocale();
  let {collection} = useListState(props);

  // TODO: Is CardView a single column grid? If so, is each card a "cell" within a row? Does each row have a single card or multiple?
  // Figure out what to pass to "items" here
  let gridCollection = useMemo(() => new GridCollection<T>({
    columnCount: 1,
    items: [...collection].map(item => ({
      type: 'item',
      childNodes: [{
        ...item,
        index: 0,
        type: 'cell'
      }]
    }))
  }), [collection]);

  let state = useGridState({
    ...props,
    collection: gridCollection,
    // TODO: this is a tentative change to make SelectionManager return the cell key on selection
    allowsCellSelection: true
  });

  // TODO: need to fix the typescript here, perhaps add a new type in Card types which is a Layout w/ these properties
  // TODO: double check that this is the correct collection being set (we wanna use the list collection for the keyboard delegate?)
  // If not, update the gridlayout code to use the gridCollection
  cardViewLayout.collection = collection;
  cardViewLayout.disabledKeys = state.disabledKeys;
  cardViewLayout.isLoading = isLoading;
  cardViewLayout.direction = direction;

  let {gridProps} = useGrid({
    ...props,
    isVirtualized: true,
    // TODO: fix the typescript here, layout definition need to show that it implements keyboard delegate
    keyboardDelegate: cardViewLayout
  }, state, domRef);

  return (
    <CardViewContext.Provider value={{state, cardOrientation, cardSize, isQuiet, cardType: cardViewLayout.cardType}}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        ref={domRef}
        focusedKey={state.selectionManager.focusedKey}
        sizeToFit="height"
        scrollDirection="vertical"
        layout={cardViewLayout}
        collection={collection}
        isLoading={isLoading}
        onLoadMore={onLoadMore}>
        {(type, item) => {
          if (type === 'item') {
            return (
              <InternalCard item={item} />
            )
          } else if (type === 'loader') {
            return (
              <CenteredWrapper>
                <ProgressCircle
                  isIndeterminate
                  aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')} />
              </CenteredWrapper>
            )
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

// TODO filler centerwrapper from ListView, check if is valid
function CenteredWrapper({children}) {
  let {state} = useContext(CardViewContext);
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

import {useGridCell, useGridRow} from '@react-aria/grid';
import {CardBase} from './CardBase';

function InternalCard(props) {
  let {
    item
  } = props;
  let {state, cardOrientation, cardSize, isQuiet, cardType} = useContext(CardViewContext);
  // TODO: check if selection is enabled here and if so render the checkbox on the card
  let allowsSelection = state.selectionMode !== 'none';

  // item.rendered will have the children provided to the Card (e.g. Image, ActionMenu, etc)
  // item.props will have all other relevant info: size, orientation, isQuiet, etc
  // To get the proper isQuiet from item.props vs the info coming from the CardView context,
  // we can check the cardType + isQuiet from CardView context and compare with isQuiet from item.props and make a decision
  // based on if the CardView allows isQuiet for the specific layout


  let ref = React.useRef<HTMLDivElement>();
  // let ref = useRef<DOMRefValue<HTMLDivElement>>();
  // let unwrappedRef = useUnwrapDOMRef(ref);

  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true
  }, state, ref);
  // let {rowProps} = useGridRow({
  //   node: item,
  //   isVirtualized: true
  // }, state, unwrappedRef);

  let {gridCellProps} = useGridCell({
    node: item,
    focusMode: 'cell'
  }, state, ref);
  // let {gridCellProps} = useGridCell({
  //   node: item,
  //   focusMode: 'cell'
  // }, state, unwrappedRef);

  return (
    <div {...rowProps}>
      {/* TODO: I presume we ignore all props passed in via item.props? */}
      <CardBase ref={ref} articleProps={gridCellProps} isQuiet={isQuiet || cardType === 'quiet'}>
        {item.rendered}
      </CardBase>
    </div>
  )
}

/**
 * TODO: Add description of component here.
 */
 const _CardView = React.forwardRef(CardView) as <T>(props: SpectrumCardViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_CardView as CardView};
