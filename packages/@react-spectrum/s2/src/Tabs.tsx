/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Tabs as RACTabs, TabsProps as AriaTabsProps, TabList as RACTabList, TabListProps as AriaTabListProps, Tab as RACTab, TabProps as AriaTabProps, TabPanel as AriaTabPanel, TabPanelProps as AriaTabPanelProps, Provider, TabListStateContext} from 'react-aria-components';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {ReactNode, createContext, useContext, forwardRef, useRef, useEffect, useState, useCallback, useLayoutEffect} from 'react';
import {IconContext} from './Icon';
// import {Text} from './Content';
import {raw} from '../style/style-macro' with {type: 'macro'};
import {DOMRef, Collection, Key} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from '@react-aria/i18n';

interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'>, StyleProps { // is height a style prop we want to allow for tabs?
  children?: ReactNode,
  density?: 'compact' | 'regular'
}

interface TabProps extends Omit<AriaTabProps, 'children' | 'style' | 'className'> {
  children?: ReactNode
}

// interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'children' | 'style' | 'className'>{
//   children?: ReactNode
// }

export function TabPanel(props: AriaTabPanelProps) {
  return (
    <AriaTabPanel {...props} className={style({marginTop: 4, color: 'neutral'})} />
  );
}

const tab = style({
  ...focusRing(),
  display: 'inline-flex', // will this cause issues with collapse behavior eventually?
  color: {
    default: 'neutral-subdued',
    isSelected: 'neutral',
    isHovered: 'neutral-subdued',
    isDisabled: 'disabled'
  },
  borderRadius: 'sm',
  gap: size(6),
  height: {
    density: {
      compact: 32,
      regular: 48
    }
  },
  alignItems: 'center',
  position: 'relative'
});

const icon = style({
  paddingX: 4,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tab(props: TabProps) {
  let {density} = useContext(TabsInternalContext);

  return (
    <RACTab 
      {...props}
      className={renderProps => tab({...renderProps, density})}>
      <Provider
        values={[
          [IconContext, {styles: icon}]
        ]}>
        {props.children}
      </Provider>
    </RACTab>
  );
}

const tablist = style({
  display: 'flex',
  alignItems: 'center', // may or may not need this depending on tab alignItems
  height: {
    density: {
      compact: 32,
      regular: 48
    }
  },
  gap: {
    density: {
      compact: 24,
      regular: 32
    }
  },
  flexDirection: {
    orientation: {
      vertical: 'column'
    }
  },
  borderColor: 'gray-400'
});

const selectedIndicator = style({
  position: 'absolute',
  width: 'full',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  // backgroundColor: {
  //   default: 'black',
  //   isDisabled: 'disabled'
  // },
  height: size(2),
  bottom: 0,
  // borderColor: {
  //   isDisabled: 'disabled'
  // },
  borderStyle: 'solid',
  borderRadius: 'lg',
  borderWidth: '[1px]',
  boxSizing: 'border-box'
});

function isAllTabsDisabled<T>(collection: Collection<T> | null, disabledKeys: Set<Key>) {
  let selectedKey = null;
  if (collection) {
    if (disabledKeys.size < collection.size) {
      return false;
    }
    selectedKey = collection.getFirstKey();
    
    let index = 0;
    while (index < collection.size) {
      // @ts-ignore
      if (!disabledKeys.has(selectedKey)) {
        return false;
      }
      // @ts-ignore
      selectedKey = collection.getKeyAfter(selectedKey);
      index++;
    }
  }

  return true;
}

export function TabList<T extends object>(props: AriaTabListProps<T>) {
  let {density, isDisabled: isTabsDisabled, disabledKeys} = useContext(TabsInternalContext);
  let state = useContext(TabListStateContext);
  let [selectedTab, setSelectedTab] = useState<HTMLElement | undefined>(undefined);
  let {direction} = useLocale();
  let tablistRef = useRef<HTMLDivElement>(null);
  let isDisabled = isTabsDisabled || isAllTabsDisabled(state?.collection, disabledKeys ? new Set(disabledKeys) : new Set(null)); // should disabledKeys type actually be Set<Key | Null>

  useEffect(() => {    
    if (tablistRef?.current) {
      let tab: HTMLElement | null = tablistRef.current.querySelector('[role=tab][data-selected=true]');

      if (tab != null) {
        setSelectedTab(tab);
      }
    }

  }, [tablistRef, state?.selectedItem]);

  let [offsetStyle, setOffsetStyle] = useState(0);
  let onResize = useCallback(() => {
    if (selectedTab) {
      // In RTL, calculate the transform from the right edge of the tablist so that resizing the window doesn't break the Tabline position due to offsetLeft changes
      let offset = direction === 'rtl' ? -1 * ((selectedTab.offsetParent as HTMLElement)?.offsetWidth - selectedTab.offsetWidth - selectedTab.offsetLeft) : selectedTab.offsetLeft;
      setOffsetStyle(offset);
    }
  }, [direction, setOffsetStyle, selectedTab]);

  useLayoutEffect(() => {
    onResize();
  }, [onResize, state?.selectedKey, state]);

  return (
    <div className={style({position: 'relative'})}>
      <RACTabList 
        {...props}
        ref={tablistRef}
        className={renderProps => tablist({...renderProps, density})} />
      {/* how to do this without raw? */}
      <div style={{width: selectedTab?.offsetWidth, transform: `translateX(${offsetStyle}px)`}} className={selectedIndicator({isDisabled}) + ' ' + raw('transition: transform 130ms ease-in-out 0s, width 130ms ease-in-out 0s')} />
    </div>
  );
}

const tabs = style({
  display: 'flex',
  fontFamily: 'sans',
  flexDirection: {
    orientation: {
      horizontal: 'column'
    }
  }
}, getAllowedOverrides());

const TabsInternalContext = createContext<TabsProps>({});

function Tabs(props: TabsProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);

  return (
    <RACTabs 
      {...props}
      ref={domRef}
      className={renderProps => (props.UNSAFE_className || '') + tabs({...renderProps}, props.styles)}>
      <Provider
        values={[
          [TabsInternalContext, {density: props.density || 'regular', isDisabled: props.isDisabled, disabledKeys: props.disabledKeys}]
        ]}>
        {props.children}
      </Provider>
    </RACTabs>
  );
}

const _Tabs = forwardRef(Tabs);
export {_Tabs as Tabs};
