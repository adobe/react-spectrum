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

import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {CollectionView} from '@react-aria/collections';
import {Item, ListLayout, Section} from '@react-stately/collections';
import {MenuContext} from './context';
import {MenuDivider} from './MenuDivider';
import {MenuHeading} from './MenuHeading';
import {MenuItem} from './MenuItem';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, useContext, useMemo} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu';
import {useProvider} from '@react-spectrum/provider';
import {useTreeState} from '@react-stately/tree'; 

export {Item, Section};

export function Menu<T>(props: SpectrumMenuProps<T>) {
  let {scale} = useProvider();
  let layout = useMemo(() => 
    new ListLayout({
      estimatedRowHeight: scale === 'large' ? 48 : 32,
      estimatedHeadingHeight: scale === 'large' ? 31 : 25
    })
  , [scale]);

  let contextProps = useContext(MenuContext);
  let completeProps = {
    ...mergeProps(contextProps, props),
    selectionMode: props.selectionMode || 'none'
  };

  let state = useTreeState(completeProps);
  let {menuProps, menuItemProps} = useMenu(completeProps, state, layout);
  let {styleProps} = useStyleProps(completeProps);
  let menuContext = mergeProps(menuProps, completeProps);

  return (
    <MenuContext.Provider value={menuContext}>
      <CollectionView
        {...filterDOMProps(completeProps)}
        {...styleProps}
        {...menuProps}
        focusedKey={state.selectionManager.focusedKey}
        sizeToFit="height"
        className={
          classNames(
            styles, 
            'spectrum-Menu',
            styleProps.className
          )
        }
        layout={layout}
        collection={state.tree}>
        {(type, item) => {
          if (type === 'section') {
            // Only render the Divider if it isn't the first Heading (extra equality check to guard against rerenders)
            if (item.key === state.tree.getKeys().next().value) {
              return (
                <MenuHeading item={item} />
              );
            } else {
              return (
                <Fragment>
                  <MenuDivider />
                  <MenuHeading item={item} />
                </Fragment>
              );
            }
          }

          return (   
            <MenuItem
              {...menuItemProps}
              item={item}
              state={state} />
          );
        }}
      </CollectionView>
    </MenuContext.Provider>
  );
}
