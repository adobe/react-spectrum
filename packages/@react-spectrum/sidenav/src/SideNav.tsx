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
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SpectrumSideNavProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useSideNav} from '@react-aria/sidenav';
import {useTreeState} from '@react-stately/tree';

export function SideNav<T>(props: SpectrumSideNavProps<T>) {
  let state = useTreeState({...props, selectionMode: 'single'});

  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);

  let {navProps, listProps} = useSideNav(props, state, layout);

  let {styleProps} = useStyleProps(props);

  return (
    <nav
      {...filterDOMProps(props)}
      {...navProps}
      {...styleProps} >
      <CollectionView
        {...listProps}
        focusedKey={state.selectionManager.focusedKey}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={state.tree}>
        {(type, item) => {
          if (type === 'section') {
            return (
              <SideNavHeading
                item={item} />
            );
          }

          return (
            <SideNavItem
              state={state}
              item={item} />
          );
        }}
      </CollectionView>
    </nav>
  );
}
