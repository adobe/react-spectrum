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
import {ListLayout, Node} from '@react-stately/collections';
import React, {ReactElement, useMemo} from 'react';
import {ReusableView} from '@react-stately/collections';
import {SideNavItem} from './SideNavItem';
import {SpectrumSideNavProps} from '@react-types/sidenav';
import {SideNavSection} from './SideNavSection';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useSideNav} from '@react-aria/sidenav';
import {useTreeState} from '@react-stately/tree';

export function SideNav<T>(props: SpectrumSideNavProps<T>) {
  let state = useTreeState({...props, selectionMode: 'single'});
  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);
  let {navProps, listProps} = useSideNav(props, state, layout);
  let {styleProps} = useStyleProps(props);

  // This overrides collection view's renderWrapper to support heirarchy of items in sections.
  // The header is extracted from the children so it can receive ARIA labeling properties.
  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    if (reusableView.viewType === 'section') {
      return (
        <SideNavSection
          key={reusableView.key}
          reusableView={reusableView}
          header={children.find(c => c.viewType === 'header')}>
          {renderChildren(children.filter(c => c.viewType === 'item'))}
        </SideNavSection>
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
    <nav
      {...filterDOMProps(props)}
      {...navProps}
      {...styleProps}>
      <CollectionView
        {...listProps}
        focusedKey={state.selectionManager.focusedKey}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={state.collection}
        renderWrapper={renderWrapper}>
        {(type, item) => {
          if (type === 'item') {
            return (
              <SideNavItem
                state={state}
                item={item} />
            );
          }
        }}
      </CollectionView>
    </nav>
  );
}
