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
import React, {ReactElement, useContext} from 'react';
import {SpectrumCardViewProps} from '@react-types/card';
// TODO: get rid of useCardView? Sounds like we just use useGrid.
// import {useCardView} from '@react-aria/card';
// TODO: get rid of useCardViewState? Do we need, sounds like we'll just be using useGridState
// import {useCardViewState} from '@react-stately/card';
import {Virtualizer} from '@react-aria/virtualizer';
import {useListState} from '@react-stately/list';
import {GridCollection, useGridState} from '@react-stately/grid';
import {GridKeyboardDelegate, useGrid} from '@react-aria/grid';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {ProgressCircle} from '@react-spectrum/progress';

import cardViewStyles from './cardview.css';

const CardViewContext = React.createContext(null);

function CardView<T extends object>(props: SpectrumCardViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let {
    cardOrientation,
    cardSize,
    isQuiet,
    renderEmptyState,
    layout
  } = props;
  let cardViewLayout = typeof layout === 'function' ? new layout({cardSize, cardOrientation}) : layout;
  // TODO:
  // What exactly is the layout of CardView going to be? Is it a single column Grid with each row having child Card elements?
  // Or is it a multi column grid with each Card being a Cell in the Row?
  // " Each card is represented as a row in the grid with a single cell inside." Does this mean you have rows next to each other? Feels weird, check v2 implementation


  // TODO: Don't think we need formatMessage and collator here, CardView won't support typeahead right?
  // let formatMessage = useMessageFormatter(intlMessages);
  // let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let {collection} = useListState(props);

  // TODO: Is CardView a single column grid? If so, is each card a "cell" within a row? Does each row have a single card or multiple?
  // Figure out what to pass to "items" here
  let gridCollection = React.useMemo(() => new GridCollection<T>({
    columnCount: 1,
    items: [...collection].map(item => ({
      type: 'item',
      childNodes: [{
        ...item,
        index: 0,
        type: 'gridcell'
      }]
    }))
  }), [collection]);

  let state = useGridState({
    ...props,
    collection: gridCollection
  });

  // TODO: need to fix the typescript here, perhaps add a new type in Card types which is a Layout w/ these properties
  cardViewLayout.collection = state.collection;
  cardViewLayout.disabledKeys = state.disabledKeys;
  cardViewLayout.isLoading = props.isLoading;
  cardViewLayout.direction = direction;

  // TODO: placeholder keyboardDelegate, will be replaced by the layout specific keyboard delegates
  // Will need to figure out how to get the proper above/below/right/left keys. If CardView is regarded as a single
  // column grid, but the layout is actually multiple columns and rows then it will be a bit tricky. But if it is a single column
  // with multiple rows, and each row contains N cards then it won't be too bad
  // Actually, left/right is simple, getKeyRight/Left will just be the current key index +/- 1 (assuming the collection is a single column grid w/ each card being its own row). Up/down
  // will need to be overriden where we'll need to calculate the number of columns ourselves since the collection won't be an accurate representation of the current visual layout.
  let keyboardDelegate = React.useMemo(() => new GridKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref: domRef,
    direction,
    focusMode: 'cell'
  }), [state, domRef]);
  let {gridProps} = useGrid({
    ...props,
    isVirtualized: true,
    // TODO: replace this with the gridLayout since it has positional keyabove/below logic
    keyboardDelegate
  }, state, domRef);

  console.log('collection', collection, cardViewLayout);
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
        isLoading={props.isLoading}
        onLoadMore={props.onLoadMore}>
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
                  // TODO add formatMessage
                  // aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')}
                  />
              </CenteredWrapper>
            )
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

function InternalCard(props) {
  let {
    item
  } = props;
  let {state, cardOrientation, cardSize, isQuiet} = useContext(CardViewContext);
  // TODO: check if selection is enabled here and if so render the checkbox on the card
  let allowsSelection = state.selectionMode !== 'none';

  // item.rendered will have the children provided to the Card (e.g. Image, ActionMenu, etc)
  // item.props will have all other relevant info: size, orientation, isQuiet, etc
  // To get the proper isQuiet from item.props vs the info coming from the CardView context,
  // we can check the cardType + isQuiet from CardView context and compare with isQuiet from item.props and make a decision
  // based on if the CardView allows isQuiet for the specific layout

  // TODO this will have a bunch of other stuff such as useGridRow and useGridCell

  // TODO: Outer div is row, inner div is cell

  return (
    <div>
      <img src={item.props.src} />
    </div>
  )
}

/**
 * TODO: Add description of component here.
 */
 const _CardView = React.forwardRef(CardView) as <T>(props: SpectrumCardViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_CardView as CardView};
