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
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, Node} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
import {GridKeyboardDelegate, useGrid} from '@react-aria/grid';
import {ListItem} from './ListItem';
import {ListLayout} from '@react-stately/layout';
import {ListState, useListState} from '@react-stately/list';
import React, {ReactElement, useMemo} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import {useCollator, useLocale} from '@react-aria/i18n';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer, VirtualizerItem} from '@react-aria/virtualizer';
import listStyles from './index.css';


export const ListContext = React.createContext(null);

export function useListLayout<T>(state: ListState<T>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = useMemo(() =>
      new ListLayout<T>({
        estimatedRowHeight: scale === 'large' ? 48 : 32,
        estimatedHeadingHeight: scale === 'large' ? 33 : 26,
        padding: scale === 'large' ? 5 : 4, // TODO: get from DNA
        collator
      })
    , [collator, scale]);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

function List<T>(props, ref: DOMRef<HTMLDivElement>) {
  let {
    shouldUseVirtualFocus,
    transitionDuration = 0
  } = props;
  let domRef = useDOMRef(ref);
  let {collection} = useListState(props);

  let gridCollection = new GridCollection({
    columnCount: 1,
    items: [...collection].map(item => ({
      type: 'row',
      childNodes: [{
        ...item,
        index: 0,
        type: 'cell'
      }]
    }))
  });


  let state = useGridState({
    ...props,
    collection: gridCollection
  });
  let layout = useListLayout(state); // TODO should layout return nulls?

  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let keyboardDelegate = new GridKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref: domRef,
    direction,
    collator,
    focusMode: 'cell'
  });
  let {gridProps} = useGrid({
    keyboardDelegate,
    ref: domRef
    // focusMode: 'cell'
  }, state);

  console.log('selectedkey', state.selectionManager.focusedKey)
  let {styleProps} = useStyleProps(props);

  // This overrides collection view's renderWrapper to support hierarchy of items in sections.
  // The header is extracted from the children so it can receive ARIA labeling properties.
  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    // TOOD handle sections?

    return (
      <VirtualizerItem
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent} />
    );
  };

  // TODO: add renderView?

  console.log('list styles', listStyles)
  console.log('list styles',
    classNames(
      listStyles,
      'react-spectrum-List',
      styleProps.className
    ))
  // todo: add isLoading, onLoadMore
  return (
    <ListContext.Provider value={{state, keyboardDelegate}}>
      <Virtualizer
        {...gridProps}
        {...styleProps}
        ref={domRef}
        focusedKey={state.selectionManager.focusedKey}
        sizeToFit="height"
        scrollDirection="vertical"
        className={
          classNames(
            listStyles,
            'react-spectrum-List',
            styleProps.className
          )
        }
        layout={layout}
        collection={collection}
        renderWrapper={renderWrapper}
        transitionDuration={transitionDuration}
        shouldUseVirtualFocus={shouldUseVirtualFocus}>
        {(type, item) => {
          if (type === 'item')  {
            return (
              <ListItem item={item} shouldUseVirtualFocus={shouldUseVirtualFocus} />
            );
          } else if (type === 'loader') {
            return (<div>wait circle</div>);
          } else if (type === 'placeholder') {
            return (<div>placeholder</div>);
          }

        }}
      </Virtualizer>
    </ListContext.Provider>
  );

  // TODO adding grid props makes the grid keyboard delegate the main keyboard listener?
  return (
    <div
      {...gridProps}
      ref={domRef}>
      {
        [...collection].map(item =>
          <ListItem item={item} state={state} delegate={keyboardDelegate} />
        )
      }
    </div>
  );
}


const _List = React.forwardRef(List); // as (pro[s &]) => ReactElement;
export {_List as List};
