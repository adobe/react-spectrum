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
import {CollectionChildren, DOMProps, Node, Orientation, StyleProps} from '@react-types/shared';
import {ListState, useListState} from '@react-stately/list';
import React, {ReactNode, useEffect, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {Tab} from './Tab';
import {useProviderProps} from '@react-spectrum/provider';
import {useTabs} from '@react-aria/tabs';

interface TabProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ListState<T>,
  title?: ReactNode,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean,
  onSelect?: () => void
}

interface TabListProps<T> extends DOMProps, StyleProps {
  orientation?: Orientation,
  isQuiet?: boolean,
  density?: 'compact',
  isDisabled?: boolean,
  overflowMode?: 'dropdown' | 'scrolling',
  keyboardActivation?: 'automatic' | 'manual',
  children: CollectionChildren<TabProps<T>>,
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  isEmphasized?: boolean
}

// TODO: Implement functionality related to overflowMode
export function TabList<T>(props: TabListProps<T>) {
  props = useProviderProps(props);

  let ref = useRef<any>(); // Had to put this <any> in order to get around a null check.
  // let [tabsArray, setTabsArray] = useState([]);

  // useEffect(() => {
  //   let tabs = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item'])); // v3 what do we with these?
  //   setTabsArray(tabs);
  // }, [props.children]);

  /** Defaults. */
  let {
    orientation = 'horizontal',
    isQuiet = false,
    density = '',
    isDisabled,
    defaultSelectedItem,
    onSelectionChange,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let state = useListState({ 
    ...props, 
    selectionMode: 'single',
    onSelectionChange,
    disallowEmptySelection: true
  });
  let {tabListProps} = useTabs(props, state, ref);

  useEffect(() => {
    if (state.collection.size) {
      if (defaultSelectedItem) {
        state.selectionManager.replaceSelection(defaultSelectedItem);
      } else {
        state.selectionManager.replaceSelection(state.collection.getFirstKey());
      }
    }
  }, [state.collection.size]);

  // let childArray = React.Children.toArray(props.children);
  // let selectedIndex = findSelectedIndex(childArray, state);
  // let selectedTab = tabsArray[selectedIndex];

  return (
    <div
      {...styleProps}
      ref={ref}
      className={classNames(
        styles,
        'spectrum-Tabs',
        `spectrum-Tabs--${orientation}`,
        {'spectrum-Tabs--quiet': isQuiet},
        density ? `spectrum-Tabs--${density}` : '',
        styleProps.className
      )}
      {...tabListProps}>
      {[...state.collection].map(item => (
        <Tab
          key={item.key}
          item={item}
          state={state}
          isDisabled={isDisabled} />
        )
      )}
    </div>
  );
}

// function TabLine({orientation, selectedTab}) {
//   // v3 clean this up a bit
//   // Ideally this would be a DNA variable, but vertical tabs aren't even in DNA, soo...
//   let verticalSelectionIndicatorOffset = 12;

//   let style = {
//     transform: orientation === 'vertical'
//       ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
//       : `translateX(${selectedTab.offsetLeft}px) `,
//     width: undefined,
//     height: undefined
//   };

//   if (orientation === 'horizontal') {
//     style.width = `${selectedTab.offsetWidth}px`;
//   } else {
//     style.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
//   }

//   return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
// }

// function findSelectedIndex(childArray, state) {
//   return childArray.findIndex((child) =>
//     child.props.key === state.selectedItem
//   );
// }
