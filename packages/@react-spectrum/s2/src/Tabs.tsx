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

import {TabListProps as AriaTabListProps, TabPanel as AriaTabPanel, TabPanelProps as AriaTabPanelProps, TabProps as AriaTabProps, TabsProps as AriaTabsProps, Provider, Tab as RACTab, TabList as RACTabList, Tabs as RACTabs, TabListStateContext} from 'react-aria-components';
import {Collection, DOMRef, Key, Orientation} from '@react-types/shared';
import {createContext, forwardRef, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {raw} from '../style/style-macro' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'>, StyleProps { // is height a style prop we want to allow for tabs?
  children?: ReactNode,
  density?: 'compact' | 'regular'
}

interface TabProps extends Omit<AriaTabProps, 'children' | 'style' | 'className'> {
  children?: ReactNode
}

interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'children' | 'style' | 'className'>{
  children?: ReactNode
}

interface TabPanelProps extends Omit<AriaTabPanelProps, 'children' | 'style' | 'className'>{
  children?: ReactNode
}

export function TabPanel(props: TabPanelProps) {
  return (
    <AriaTabPanel {...props} className={style({marginTop: 4, color: 'neutral'})} />
  );
}

const tab = style({
  ...focusRing(),
  display: 'inline-flex',
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
  paddingEnd: 4,
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
  height: {
    orientation: {
      horizontal: {
        density: {
          compact: 32,
          regular: 48
        }
      }
    }
  },
  gap: {
    orientation: {
      horizontal: {
        density: {
          compact: 24,
          regular: 32
        }
      }
    }
  },
  flexDirection: {
    orientation: {
      vertical: 'column'
    }
  },
  paddingEnd: {
    orientation: {
      vertical: 20
    }
  },
  paddingStart: {
    orientation: {
      vertical: 12
    }
  },
  borderColor: 'gray-400'
});

export function TabList<T extends object>(props: TabListProps<T>) {
  let {density, isDisabled, disabledKeys, orientation = 'horizontal'} = useContext(TabsInternalContext);
  let state = useContext(TabListStateContext);
  let [selectedTab, setSelectedTab] = useState<HTMLElement | undefined>(undefined);
  let tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {    
    if (tablistRef?.current) {
      let tab: HTMLElement | null = tablistRef.current.querySelector('[role=tab][data-selected=true]');

      if (tab != null) {
        setSelectedTab(tab);
      }
    }

  }, [tablistRef, state?.selectedItem]);

  return (
    <div className={style({position: 'relative'})}>
      {orientation === 'vertical' && 
        <TabLine disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} />}
      <RACTabList 
        {...props}
        ref={tablistRef}
        className={renderProps => tablist({...renderProps, density})} />
      {orientation === 'horizontal' && 
        <TabLine disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} />}
    </div>
  );
}

function isAllTabsDisabled<T>(collection: Collection<T> | null, disabledKeys: Set<Key>) {
  let selectedKey: Key | null = null;
  if (collection) {
    if (disabledKeys.size < collection.size) {
      return false;
    }
    selectedKey = collection.getFirstKey();
    
    let index = 0;
    while (index < collection.size) {
      if (selectedKey && !disabledKeys.has(selectedKey)) {
        return false;
      }

      // @ts-ignore
      selectedKey = collection.getKeyAfter(selectedKey);
      index++;
    }
  }

  return true;
}

interface TabLineProps {
  disabledKeys: Iterable<Key> | undefined,
  isDisabled: boolean | undefined,
  selectedTab: HTMLElement | undefined,
  orientation?: Orientation
}

const selectedIndicator = style({
  position: 'absolute',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  height: size(2),
  bottom: {
    orientation: {
      horizontal: 0
    }
  },
  borderStyle: 'solid',
  borderRadius: 'lg',
  borderWidth: '[1px]',
  boxSizing: 'border-box'
});

function TabLine(props: TabLineProps) {
  let {
    disabledKeys,
    isDisabled: isTabsDisabled,
    selectedTab,
    orientation
  } = props;
  let {direction} = useLocale();
  let state = useContext(TabListStateContext);

  // We want to add disabled styling to the selection indicator only if all the Tabs are disabled
  let [isDisabled, setIsDisabled] = useState<boolean>(false);
  useEffect(() => {
    let isDisabled = isTabsDisabled || isAllTabsDisabled(state?.collection, disabledKeys ? new Set(disabledKeys) : new Set(null));
    setIsDisabled(isDisabled);
  }, [state?.collection, disabledKeys, isTabsDisabled, setIsDisabled]);

  let [style, setStyle] = useState<{transform: string | undefined, width: string | undefined, height: string | undefined}>({
    transform: undefined,
    width: undefined,
    height: undefined
  });

  let onResize = useCallback(() => {
    if (selectedTab) {
      let styleObj: { transform: string | undefined, width: string | undefined, height: string | undefined } = { 
        transform: undefined, 
        width: undefined, 
        height: undefined 
      };

      // In RTL, calculate the transform from the right edge of the tablist so that resizing the window doesn't break the Tabline position due to offsetLeft changes
      let offset = direction === 'rtl' ? -1 * ((selectedTab.offsetParent as HTMLElement)?.offsetWidth - selectedTab.offsetWidth - selectedTab.offsetLeft) : selectedTab.offsetLeft;
      styleObj.transform = orientation === 'vertical'
        ? `translateY(${selectedTab.offsetTop}px)`
        : `translateX(${offset}px)`;

      if (orientation === 'horizontal') {
        styleObj.width = `${selectedTab.offsetWidth}px`;
      } else {
        styleObj.height = `${selectedTab.offsetHeight}px`;
      }
      setStyle(styleObj);
    }
  }, [direction, setStyle, selectedTab, orientation]);

  useLayoutEffect(() => {
    onResize();
  }, [onResize, state?.selectedKey, state, orientation]);
  
  return (
    <div style={{...style}} className={selectedIndicator({isDisabled, orientation}) + ' ' + raw('transition: transform 130ms ease-in-out 0s, width 130ms ease-in-out 0s')} />
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
          [TabsInternalContext, {density: props.density || 'regular', isDisabled: props.isDisabled, disabledKeys: props.disabledKeys, orientation: props.orientation}]
        ]}>
        {props.children}
      </Provider>
    </RACTabs>
  );
}

const _Tabs = forwardRef(Tabs);
export {_Tabs as Tabs};
