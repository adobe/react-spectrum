import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, ReactNode} from 'react';
import {TabList} from './TabList';
import {useTabListState} from '@react-stately/tabs';
import {useTabs} from '@react-aria/tabs';
import styles from '../style/index.css';

type Orientation = 'horizontal' | 'vertical';

interface TabProps extends React.HTMLAttributes<HTMLElement> {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
}

interface TabsProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: Orientation,
  isQuiet?: boolean,
  density?: 'compact',
  isDisabled?: boolean,
  overflowMode?: 'dropdown' | 'scrolling',
  keyboardActivation?: 'automatic' | 'manual',
  children: ReactElement<TabProps> | ReactElement<TabProps>[],
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  isEmphasized?: boolean
}

export function Tabs(props: TabsProps) {
  let state = useTabListState(props);
  let {
    className,
    orientation = 'horizontal' as Orientation,
    onSelectionChange = () => {},
    ...otherProps
  } = props;

  let {tabPanelProps, tabsPropsArray} = useTabs(props, state);
  let children = React.Children.map(props.children, (c, i) =>
    typeof c === 'object' && c ? React.cloneElement(c, tabsPropsArray[i]) : c
  );

  let selected = children.find((child) => child.props.value === state.selectedItem) || children[0];
  let body = selected.props.children;

  return (
    <div
      className={classNames(
        styles,
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        className)}>
      <TabList
        {...otherProps}
        orientation={orientation}
        onSelectionChange={state.setSelectedItem}>
        {children}
      </TabList>
      <div
        className="react-spectrum-TabPanel-body"
        {...tabPanelProps}>
        {body}
      </div>
    </div>
  );
}
