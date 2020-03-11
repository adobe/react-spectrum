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
import {CollectionItem, CollectionView} from '@react-aria/collections';
import {ListBoxOption} from './ListBoxOption';
import {ListBoxSection} from './ListBoxSection';
import {ListLayout, Node} from '@react-stately/collections';
import React, {ReactElement, useMemo} from 'react';
import {ReusableView} from '@react-stately/collections';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useCollator} from '@react-aria/i18n';
import {useListBox} from '@react-aria/listbox';
import {useListState} from '@react-stately/list';
import {useProvider} from '@react-spectrum/provider';

export function ListBox<T>(props: SpectrumMenuProps<T>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = useMemo(() => 
    new ListLayout({
      estimatedRowHeight: scale === 'large' ? 48 : 35,
      estimatedHeadingHeight: scale === 'large' ? 37 : 30,
      collator
    })
  , [collator, scale]);

  let completeProps = {
    ...props,
    selectionMode: props.selectionMode || 'single'
  };

  let state = useListState(completeProps);
  let {listBoxProps} = useListBox({...completeProps, keyboardDelegate: layout, isVirtualized: true}, state);
  let {styleProps} = useStyleProps(completeProps);

  // This overrides collection view's renderWrapper to support heirarchy of items in sections.
  // The header is extracted from the children so it can receive ARIA labeling properties.
  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    if (reusableView.viewType === 'section') {
      return (
        <ListBoxSection
          key={reusableView.key}
          state={state}
          reusableView={reusableView}
          header={children.find(c => c.viewType === 'header')}>
          {renderChildren(children.filter(c => c.viewType === 'item'))}
        </ListBoxSection>
      );
    }

    return (
      <CollectionItem 
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent} />
    );
  };

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
      collection={state.collection}
      renderWrapper={renderWrapper}>
      {(type, item) => {
        if (type === 'item') {
          return (
            <ListBoxOption
              item={item}
              state={state} />
          );
        }
      }}
    </CollectionView>
  );
}
