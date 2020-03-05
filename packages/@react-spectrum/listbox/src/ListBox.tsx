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
import {ListLayout} from '@react-stately/collections';
import React, {useMemo} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useProvider} from '@react-spectrum/provider';
import { ListBoxSection } from './ListBoxSection';
import { ListBoxOption } from './ListBoxOption';
import { useListState } from '@react-stately/list';
import { useListBox } from '@react-aria/listbox';

export function ListBox<T>(props: SpectrumMenuProps<T>) {
  let {scale} = useProvider();
  let layout = useMemo(() => 
    new ListLayout({
      estimatedRowHeight: scale === 'large' ? 48 : 32,
      estimatedHeadingHeight: scale === 'large' ? 31 : 25
    })
  , [scale]);

  let completeProps = {
    ...props,
    selectionMode: props.selectionMode || 'single'
  };

  let state = useListState(completeProps);
  let {listBoxProps} = useListBox({...completeProps, keyboardDelegate: layout, isVirtualized: true}, state);
  let {styleProps} = useStyleProps(completeProps);

  return (
    <CollectionView
      {...filterDOMProps(completeProps)}
      {...styleProps}
      {...listBoxProps}
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
      collection={state.collection}>
      {(type, item) => {
        if (type === 'section') {
          return (
            <ListBoxSection item={item} state={state} />
          )
        }

        return (
          <ListBoxOption
            item={item}
            state={state} />
        );
      }}
    </CollectionView>
  );
}
