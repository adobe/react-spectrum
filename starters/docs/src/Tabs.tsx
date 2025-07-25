'use client';
import {
  Tabs as RACTabs,
  TabList as RACTabList,
  TabListProps,
  TabProps,
  Tab as RACTab,
  TabsProps,
  TabPanelProps,
  TabPanel as RACTabPanel} from 'react-aria-components';
import './Tabs.css';

export function Tabs(props: TabsProps) {
  return <RACTabs {...props} />;
}

export function TabList<T extends object>(props: TabListProps<T>) {
  return <RACTabList {...props} />;
}

export function Tab(props: TabProps) {
  return <RACTab {...props} />;
}

export function TabPanel(props: TabPanelProps) {
  return <RACTabPanel {...props} />;
}