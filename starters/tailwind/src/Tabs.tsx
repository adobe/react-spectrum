'use client';
import React from 'react';
import {
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  Tabs as RACTabs,
  SelectionIndicator,
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps,
  composeRenderProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

const tabsStyles = tv({
  base: 'flex gap-4 font-sans',
  variants: {
    orientation: {
      horizontal: 'flex-col',
      vertical: 'flex-row'
    }
  }
});

export function Tabs(props: TabsProps) {
  return (
    <RACTabs
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabsStyles({...renderProps, className})
      )} />
  );
}

const tabListStyles = tv({
  base: 'flex gap-1',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-start'
    }
  }
});

export function TabList<T extends object>(props: TabListProps<T>) {
  return (
    <RACTabList
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabListStyles({...renderProps, className})
      )} />
  );
}

const tabProps = tv({
  extend: focusRing,
  base: 'relative flex items-center cursor-default rounded-full px-4 py-1.5 text-sm font-medium transition forced-color-adjust-none',
  variants: {
    isDisabled: {
      true: 'text-gray-200 dark:text-zinc-600 forced-colors:text-[GrayText] selected:text-gray-300 dark:selected:text-zinc-500 forced-colors:selected:text-[HighlightText] selected:bg-gray-200 dark:selected:bg-zinc-600 forced-colors:selected:bg-[GrayText]'
    }
  }
});

export function Tab(props: TabProps) {
  return (
    <RACTab
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabProps({...renderProps, className})
      )}>
      {composeRenderProps(props.children, children => (<>
        {children}
        <SelectionIndicator className="absolute top-0 left-0 w-full h-full z-10 bg-white rounded-full mix-blend-difference motion-safe:transition-[translate,width,height] " />
      </>))}
    </RACTab>
  );
}

const tabPanelStyles = tv({
  extend: focusRing,
  base: 'flex-1 p-4 text-sm text-gray-900 dark:text-zinc-100'
});

export function TabPanel(props: TabPanelProps) {
  return (
    <RACTabPanel
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabPanelStyles({...renderProps, className})
      )} />
  );
}
