'use client';
import {
  Tabs as RACTabs,
  TabList as RACTabList,
  TabListProps,
  TabProps,
  Tab as RACTab,
  TabsProps,
  TabPanelProps,
  TabPanel as RACTabPanel,
  composeRenderProps,
  SelectionIndicator
} from 'react-aria-components';
import './Tabs.css';

export function Tabs(props: TabsProps) {
  return <RACTabs {...props} />;
}

export function TabList<T extends object>(props: TabListProps<T>) {
  return <RACTabList {...props} />;
}

export function Tab(props: TabProps) {
  return (
    <RACTab {...props}>
      {composeRenderProps(props.children, children => (<>
        {children}
        <SelectionIndicator />
      </>))}
    </RACTab>
  );
}

export function TabPanel(props: TabPanelProps) {
  return <RACTabPanel {...props} />;
}