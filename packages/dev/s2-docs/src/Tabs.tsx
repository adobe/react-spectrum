'use client';

import {
  TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
  Provider,
  Tab as RACTab,
  TabList as RACTabList,
  Tabs as RACTabs,
  TabListStateContext
} from 'react-aria-components';
// import {centerBaseline} from './CenterBaseline';
import {focusRing, style}  from '@react-spectrum/s2/style' with {type: 'macro'};
import {forwardRef, ReactNode, useCallback, useContext, useRef, useState} from 'react';
import {IconContext, Text, TextContext} from '@react-spectrum/s2';
import {useId, useLayoutEffect} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'> {
  /** The content to display in the tabs. */
  children: ReactNode
}

export interface TabProps extends Omit<AriaTabProps, 'children' | 'style' | 'className'> {
  /** The content to display in the tab. */
  children: ReactNode
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'style' | 'className' | 'aria-label' | 'aria-labelledby'> {
  /** The content to display in the tablist. */
  children: ReactNode | ((item: T) => ReactNode)
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'children' | 'style' | 'className'> {
  /** The content to display in the tab panels. */
  children: ReactNode
}

const tabs = style({
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  font: 'ui'
});

/**
 * Tabs organize content into multiple sections and allow users to navigate between them. The content under the set of tabs should be related and form a coherent unit.
 */
export const Tabs = forwardRef(function Tabs(props: TabsProps) {
  return (
    <div className={tabs}>
      <RACTabs
        {...props}
        style={{display: 'contents'}}>
        {props.children}
      </RACTabs>
    </div>
  );
});

const tablist = style({
  display: 'flex',
  flexDirection: 'column',
  paddingEnd: 20,
  paddingStart: 12,
  flexShrink: 0,
  flexBasis: '[0%]',
  gap: 32,
  maxWidth: 240,
  height: 'full',
  paddingY: 4
});

export function TabList<T extends object>(props: TabListProps<T>) {
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
      className={style({position: 'relative'})}>
      <TabLine selectedTab={selectedTab} />
      <RACTabList
        {...props}
        ref={tablistRef}
        className={tablist} />
    </div>
  );
}

interface TabLineProps {
  selectedTab: HTMLElement | undefined
}

const selectedIndicator = style({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral',
    forcedColors: {
      default: 'Highlight'
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
    selectedTab
  } = props;
  let {direction} = useLocale();
  let state = useContext(TabListStateContext);

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

      styleObj.transform = `translateY(${selectedTab.offsetTop}px)`;

      styleObj.height = `${selectedTab.offsetHeight}px`;
      setStyle(styleObj);
    }
  }, [direction, setStyle, selectedTab]);

  useLayoutEffect(() => {
    onResize();
  }, [onResize, state?.selectedItem?.key, direction]);

  return (
    <div style={{...style}} className={selectedIndicator({orientation: 'vertical'})} />
  );
}

const tab = style({
  ...focusRing(),
  display: 'flex',
  color: {
    default: 'neutral-subdued',
    isSelected: 'neutral',
    isHovered: 'neutral-subdued',
    forcedColors: {
      isSelected: 'Highlight'
    }
  },
  borderRadius: 'sm',
  gap: 'text-to-visual',
  alignItems: 'center',
  position: 'relative',
  cursor: 'default',
  flexShrink: 0,
  transition: 'default',
  disableTapHighlight: true
});

const icon = style({
  display: 'block',
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tab(props: TabProps): ReactNode {
  let contentId = useId();
  let ariaLabelledBy = props['aria-labelledby'] || '';
  return (
    <RACTab
      {...props}
      // @ts-ignore
      originalProps={props}
      aria-labelledby={`${ariaLabelledBy}`}
      className={renderProps => tab({...renderProps})}>
      {({
          // @ts-ignore
          isMenu
        }) => {
        if (isMenu) {
          return props.children;
        } else {
          return (
            <Provider
              values={[
                [TextContext, {
                  // @ts-ignore
                  id: contentId,
                  styles:
                    style({
                      order: 1
                    })
                }],
                [IconContext, {
                  // render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
                  styles: icon
                }]
              ]}>
              {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
            </Provider>
          );
        }
      }}
    </RACTab>
  );
}

const tabPanel = style({
  ...focusRing(),
  marginTop: 4,
  color: 'gray-800',
  flexGrow: 1,
  flexBasis: '[0%]',
  minHeight: 0,
  minWidth: 0
});

export function TabPanel(props: TabPanelProps): ReactNode | null {
  return (
    <AriaTabPanel
      {...props}
      className={renderProps => tabPanel(renderProps)} />
  );
}
