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


export const CardViewContext = React.createContext(null);

function CardView(props: SpectrumCardViewProps, ref: DOMRef<HTMLDivElement>) {
  // Handles RSP specific style options, UNSAFE_style, and UNSAFE_className props (see https://react-spectrum.adobe.com/react-spectrum/styling.html#style-props)
  let {styleProps} = useStyleProps(props);
  // let state = useCardViewState(props);
  // let ariaProps = useCardView(props, state);
  let domRef = useDOMRef(ref);

  // TODO: Do we really use useListState? Isn't the CardView have multiple columns? Why not just useGridState?
  // What exactly is the layout of CardView going to be? Is it a single column Grid with each row having child Card elements?
  // Or is it a multi column grid with each Card being a Cell in the Row?
  // " Each card is represented as a row in the grid with a single cell inside." Does this mean you have rows next to each other? Feels weird, check v2 implementation
  // If CardView is a single column grid, the keyboard delegate feels odd how would keyBelow be determined
  // For grid layout probably not to bad to figure out since all the items are equal size ((actually GridKeyboad delegate might be enought for GridView)
  // Might be more troublesome for some of the other views since there can be a case where the is a miss match between # of items in each row

  // TODO: to test, just use the layout from listview


  return (
    <CardViewContext.Provider value={state}>
      {/* TODO need layout, collection */}
      <Virtualizer>
        {(type, item) => {
          if (type === 'card') {
            return (
              <InternalCard item={item} />
            )
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
  // item.rendered will have the children provided to the Card (e.g. Image, ActionMenu, etc)
  // item.props will have all other relevant info: size, orientation, etc

  // TODO this will have a bunch of other stuff such as useGridRow and useGridCell
  // let {state} = useContext(CardViewContext);

  // Outer div is row, inner div is cell
  return (
    <div>
      <div>
        {item.rendered}
      </div>
    </div>
  )
}

/**
 * TODO: Add description of component here.
 */
const _CardView = React.forwardRef(CardView);
export {_CardView as CardView};
