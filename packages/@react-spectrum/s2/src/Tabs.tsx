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

import {
    TabListProps as AriaTabListProps,
    TabPanel as AriaTabPanel,
    TabPanelProps as AriaTabPanelProps,
    TabProps as AriaTabProps,
    TabsProps as AriaTabsProps, 
    ContextValue,
    Provider,
    Tab as RACTab,
    TabList as RACTabList,
    Tabs as RACTabs,
    TabListStateContext,
    useSlottedContext} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Collection, DOMRef, DOMRefValue, Key, Node, Orientation} from '@react-types/shared';
import {createContext, forwardRef, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {focusRing, getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {Text, TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tabs. */
  children?: ReactNode,
  /** The amount of space between the tabs. */
  density?: 'compact' | 'regular'
}

export interface TabProps extends Omit<AriaTabProps, 'children' | 'style' | 'className'>, StyleProps {
  /** The content to display in the tab. */
  children?: ReactNode
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'children' | 'style' | 'className'>, StyleProps {
  /** The content to display in the tablist. */
  children?: ReactNode
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'children' | 'style' | 'className'>, UnsafeStyles {  
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tab panels. */
  children?: ReactNode
}

export const TabsContext = createContext<ContextValue<TabsProps, DOMRefValue<HTMLDivElement>>>(null);

const tabPanel = style({
  marginTop: 4,
  color: 'gray-800',
  flexGrow: 1,
  flexBasis: '[0%]',
  minHeight: 0,
  minWidth: 0
}, getAllowedOverrides({height: true}));

export function TabPanel(props: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + tabPanel(null, props.styles)} />
  );
}

const tab = style({
  ...focusRing(),
  display: 'flex',
  color: {
    default: 'neutral-subdued',
    isSelected: 'neutral',
    isHovered: 'neutral-subdued',
    isDisabled: 'disabled',
    forcedColors: {
      isSelected: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  borderRadius: 'sm',
  gap: 'text-to-visual',
  height: {
    density: {
      compact: 32,
      regular: 48
    }
  },
  alignItems: 'center',
  position: 'relative',
  cursor: 'default',
  flexShrink: 0,
  transition: 'default'
}, getAllowedOverrides());

const icon = style({
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tab(props: TabProps) {
  let {density} = useSlottedContext(TabsContext);

  return (
    <RACTab
      {...props}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + tab({...renderProps, density}, props.styles)}>
      <Provider
        values={[
          [TextContext, {styles: style({order: 1})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: icon
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACTab>
  );
}

const tablist = style({
  display: 'flex',
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
  flexShrink: 0,
  flexBasis: '[0%]'
});

export function TabList<T extends object>(props: TabListProps<T>) {
  let {density, isDisabled, disabledKeys, orientation} = useSlottedContext(TabsContext);
  let state = useContext(TabListStateContext);
  let [selectedTab, setSelectedTab] = useState<HTMLElement | undefined>(undefined);
  let tablistRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (tablistRef?.current) {
      let tab: HTMLElement | null = tablistRef.current.querySelector('[role=tab][data-selected=true]');

      if (tab != null) {
        setSelectedTab(tab);
      }
    }
  }, [tablistRef, state?.selectedItem?.key]);

  return (
    <div
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + style({position: 'relative'}, getAllowedOverrides())(null, props.styles)}>
      {orientation === 'vertical' &&
        <TabLine disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} density={density} />}
      <RACTabList
        {...props}
        ref={tablistRef}
        className={renderProps => tablist({...renderProps, density})} />
      {orientation === 'horizontal' &&
        <TabLine disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} density={density} />}
    </div>
  );
}

function isAllTabsDisabled<T>(collection: Collection<Node<T>> | null, disabledKeys: Set<Key>) {
  let testKey: Key | null = null;
  if (collection && collection.size > 0) {
    testKey = collection.getFirstKey();

    let index = 0;
    while (testKey && index < collection.size) {
      // We have to check if the item in the collection has a key in disabledKeys or has the isDisabled prop set directly on it
      if (!disabledKeys.has(testKey) && !collection.getItem(testKey)?.props?.isDisabled) {
        return false;
      }

      testKey = collection.getKeyAfter(testKey);
      index++;
    }
    return true;
  }
  return false;
}

interface TabLineProps {
  disabledKeys: Iterable<Key> | undefined,
  isDisabled: boolean | undefined,
  selectedTab: HTMLElement | undefined,
  orientation?: Orientation,
  density?: 'compact' | 'regular'
}

const selectedIndicator = style({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: {
    orientation: {
      horizontal: '[2px]'
    }
  },
  width: {
    orientation: {
      vertical: '[2px]'
    }
  },
  bottom: {
    orientation: {
      horizontal: 0
    }
  },
  borderStyle: 'none',
  borderRadius: 'full',
  transitionDuration: 130,
  transitionTimingFunction: 'in-out'
});

function TabLine(props: TabLineProps) {
  let {
    disabledKeys,
    isDisabled: isTabsDisabled,
    selectedTab,
    orientation,
    density
  } = props;
  let {direction} = useLocale();
  let state = useContext(TabListStateContext);

  // We want to add disabled styling to the selection indicator only if all the Tabs are disabled
  let [isDisabled, setIsDisabled] = useState<boolean>(false);
  useEffect(() => {
    let isDisabled = isTabsDisabled || isAllTabsDisabled(state?.collection || null, disabledKeys ? new Set(disabledKeys) : new Set(null));
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
  }, [onResize, state?.selectedItem?.key, direction, orientation, density]);

  return (
    <div style={{...style}} className={selectedIndicator({isDisabled, orientation})} />
  );
}

const tabs = style({
  display: 'flex',
  flexShrink: 0,
  fontFamily: 'sans',
  fontWeight: 'normal',
  flexDirection: {
    orientation: {
      horizontal: 'column'
    }
  }
}, getAllowedOverrides({height: true}));

function Tabs(props: TabsProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, TabsContext);
  let {
    density = 'regular',
    isDisabled,
    disabledKeys,
    orientation = 'horizontal'
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <RACTabs
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + tabs({...renderProps}, props.styles)}>
      <Provider
        values={[
          [TabsContext, {density, isDisabled, disabledKeys, orientation}]
        ]}>
        {props.children}
      </Provider>
    </RACTabs>
  );
}

/**
 * Tabs organize content into multiple sections and allow users to navigate between them. The content under the set of tabs should be related and form a coherent unit.
 */
const _Tabs = forwardRef(Tabs);
export {_Tabs as Tabs};
