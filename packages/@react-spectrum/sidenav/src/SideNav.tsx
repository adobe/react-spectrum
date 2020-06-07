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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {ListLayout} from '@react-stately/layout';
import {Node} from '@react-stately/collections';
import React, {ReactElement, useMemo, useRef} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import {SideNavContext} from './SideNavContext';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';
import {SpectrumSideNavProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useCollator} from '@react-aria/i18n';
import {useSideNav} from '@react-aria/sidenav';
import {useTreeState} from '@react-stately/tree';
import {Virtualizer, VirtualizerItem} from '@react-aria/virtualizer';

export function SideNav<T extends object>(props: SpectrumSideNavProps<T>) {
  let state = useTreeState({...props, selectionMode: 'single', disallowEmptySelection: true});
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = useMemo(() => new ListLayout({rowHeight: 40, collator}), [collator]);
  let ref = useRef();
  let {navProps, listProps} = useSideNav({...props, layout}, state, ref);
  let {styleProps} = useStyleProps(props);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;

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
      <VirtualizerItem
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent} />
    );
  };

  return (
    <nav
      {...navProps}
      {...styleProps}>
      <SideNavContext.Provider value={state}>
        <Virtualizer
          {...listProps}
          ref={ref}
          focusedKey={state.selectionManager.focusedKey}
          className={classNames(styles, 'spectrum-SideNav')}
          layout={layout}
          collection={state.collection}
          renderWrapper={renderWrapper}>
          {(type, item) => {
            if (type === 'item') {
              return (
                <SideNavItem item={item} />
              );
            }
          }}
        </Virtualizer>
      </SideNavContext.Provider>
    </nav>
  );
}
