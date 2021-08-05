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
import {filterDOMProps} from '@react-aria/utils';
import React, {useContext} from 'react';
import {SpectrumCardViewProps} from '@react-types/card';
// TODO: get rid of useCardView? Sounds like we just use useGrid.
// import {useCardView} from '@react-aria/card';
// TODO: get rid of useCardViewState? Do we need, sounds like we'll just be using useGridState
// import {useCardViewState} from '@react-stately/card';
import {Virtualizer} from '@react-aria/virtualizer';





// TODO Delete this, just used for Collections API item testing, copy pasta from ListView
import {ListState, useListState} from '@react-stately/list';
import {GridCollection, useGridState} from '@react-stately/grid';
import {GridKeyboardDelegate, useGrid} from '@react-aria/grid';
import {useProvider} from '@react-spectrum/provider';
import {useCollator, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {ListLayout} from '@react-stately/layout';
export function useListLayout<T>(state: ListState<T>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = React.useMemo(() =>
      new ListLayout<T>({
        estimatedRowHeight: scale === 'large' ? 48 : 32,
        padding: 0,
        collator
      })
    , [collator, scale]);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

import {GridLayout} from './';


const CardViewContext = React.createContext(null);

function CardView<T extends object>(props: SpectrumCardViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {styleProps} = useStyleProps(props);
  // let state = useCardViewState(props);
  // let ariaProps = useCardView(props, state);
  let domRef = useDOMRef(ref);
  let {
    cardOrientation,
    cardSize,
    isQuiet,
    renderEmptyState,
    // TODO: add layout back in when I get rid of the test layouts that are hard coded below
    // layout
  } = props;

  // TODO:
  // What exactly is the layout of CardView going to be? Is it a single column Grid with each row having child Card elements?
  // Or is it a multi column grid with each Card being a Cell in the Row?
  // " Each card is represented as a row in the grid with a single cell inside." Does this mean you have rows next to each other? Feels weird, check v2 implementation


  // TODO: to test, just use the layout from listview
  // TODO: Don't think we need formatMessage and collator here, CardView won't support typeahead right?
  // let formatMessage = useMessageFormatter(intlMessages);
  // let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let {collection} = useListState(props);

  // TODO: Is CardView a single column grid? If so, is each card a "cell" within a row? Does each row have a single card or multiple?
  //  Figure out what to pass to "items" here
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

  console.log('gridCollection', gridCollection, gridCollection.size, gridCollection.at(0),  gridCollection.at(1),  gridCollection.at(2))
  let state = useGridState({
    ...props,
    collection: gridCollection
  });
  console.log('state', state);

  // TODO this will be passed in via props, just keep the part where we set collection and disabledkeys
  let gridLayout = new GridLayout<T>();
  gridLayout.collection = state.collection;
  gridLayout.disabledKeys = state.disabledKeys;
  gridLayout.isLoading = props.isLoading;
  gridLayout.direction = direction;
  console.log('GLENLKGNEKL', gridLayout)


  // TODO: this is a placeholder layout. Will be replaced by the CardView specific layouts
  // Each layout will need its own validate/build functions that determine the number of columns + divide the cards into
  // visual rows depending on how large the CardView is vs Card sizes
  // let layout = useListLayout(state);

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
    // TODO: this
    keyboardDelegate
  }, state, domRef);
  console.log("BLAH", collection);

  // console.log('layout', layout);
  return (
    <CardViewContext.Provider value={{state, cardOrientation, cardSize, isQuiet, cardType: gridLayout.cardType}}>
      <Virtualizer
        {...gridProps}
        // Informs the width of the CardView
        {...styleProps}
        ref={domRef}
        focusedKey={state.selectionManager.focusedKey}
        sizeToFit="height"
        scrollDirection="vertical"
        // layout={layout}
        layout={gridLayout}
        // TODO: why do I need to pass gridCollection here...
        // collection={gridCollection}
        collection={collection}
        isLoading={props.isLoading}
        onLoadMore={props.onLoadMore}>
        {(type, item) => {
          if (type === 'item') {
            console.log('IGITI', item)
            return (
              <InternalCard item={item} />
            )
          } else if (type === 'loader') {
            return <div />;
            // TODO: Create CenteredWrapper for CardView
            // <CenteredWrapper>
            //   <ProgressCircle
            //     isIndeterminate
            //     aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')} />
            // </CenteredWrapper>
          } else if (type === 'placeholder') {
            let emptyState = props.renderEmptyState ? props.renderEmptyState() : null;
            if (emptyState == null) {
              return null;
            }

            return <div />
            // TODO: Render emptyState, think about what the wrapper should look like (use CenteredWrapper?)
          }
        }}
      </Virtualizer>
    </CardViewContext.Provider>

  );
}

function InternalCard(props) {
  let {
    item
  } = props;
  let {state, cardOrientation, cardSize, isQuiet} = useContext(CardViewContext);
  // TODO: check if selection is enabled here

  // item.rendered will have the children provided to the Card (e.g. Image, ActionMenu, etc)
  // item.props will have all other relevant info: size, orientation, isQuiet, etc
  // To get the proper isQuiet from item.props vs the info coming from the CardView context,
  // we can check the cardType + isQuiet from CardView context and compare with isQuiet from item.props and make a decision
  // based on if the CardView allows isQuiet for the specific layout

  // TODO this will have a bunch of other stuff such as useGridRow and useGridCell

  // TODO: Outer div is row, inner div is cell
  console.log('item', item)

  return (
    <div>
      <img src={item.props.src} />
    </div>
  )
}

/**
 * TODO: Add description of component here.
 */
const _CardView = React.forwardRef(CardView);
export {_CardView as CardView};
