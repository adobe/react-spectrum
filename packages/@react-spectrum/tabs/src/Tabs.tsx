import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactElement, ReactNode} from 'react';
import styles from '../style/index.css';
import {TabList} from './TabList';
import {useProviderProps} from '@react-spectrum/provider';
import {useTabListState} from '@react-stately/tabs';
import {useTabs} from '@react-aria/tabs';

type Orientation = 'horizontal' | 'vertical';

interface TabProps extends DOMProps, StyleProps {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
  onSelect?: () => void
}

interface TabsProps extends DOMProps, StyleProps {
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
  props = useProviderProps(props);
  let state = useTabListState(props);
  let {
    orientation = 'horizontal' as Orientation,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let {tabPanelProps, tabsPropsArray} = useTabs(props, state);
  let children = React.Children.map(props.children, (c, i) =>
    // @ts-ignore - TODO fix
    typeof c === 'object' && c ? React.cloneElement(c, tabsPropsArray[i]) : c
  );

  let selected = children.find((child) => child.props.value === state.selectedItem) || children[0];
  let body = selected.props.children;

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={classNames(
        styles,
        'react-spectrum-TabPanel',
        `react-spectrum-TabPanel--${orientation}`,
        styleProps.className
      )}>
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
