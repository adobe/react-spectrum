import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactElement, ReactNode, useEffect, useRef, useState} from 'react';
// eslint-disable-next-line monorepo/no-internal-import
import styles from '@spectrum-css/tabs/dist/index-vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useTabList} from '@react-aria/tabs';
import {useTabListState} from '@react-stately/tabs';

interface TabProps extends React.HTMLAttributes<HTMLElement> {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
}

interface TabListProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical',
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

// TODO: Implement functionality related to overflowMode
export function TabList(props: TabListProps) {
  props = useProviderProps(props);
  let state = useTabListState(props);
  let [tabsArray, setTabsArray] = useState([]);
  let {tabListProps} = useTabList(props);
  let ref = useRef<any>(); // Had to put this <any> in order to get around a null check.
  let childArray = React.Children.toArray(props.children);
  let selectedIndex = findSelectedIndex(childArray, state);

  useEffect(() => {
    let tabs = Array.from(ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item'])); // v3 what do we with these?
    setTabsArray(tabs);
  }, [props.children]);

  /** Defaults **/
  let {
    orientation = 'horizontal',
    isQuiet = false,
    density = '',
    className,
    isDisabled,
    ...otherProps
  } = props;

  let renderTabs = () =>
    childArray.map((child) =>
      child ? React.cloneElement(child, {
        isSelected: state.selectedItem === child.props.value,
        onSelect: () => state.setSelectedItem(child.props.value),
        isDisabled
      }) : null
  );

  let selectedTab = tabsArray[selectedIndex];

  return (
    <div
      ref={ref}
      {...filterDOMProps(otherProps)}
      className={classNames(
        styles,
        'spectrum-Tabs',
        `spectrum-Tabs--${orientation}`,
        {'spectrum-Tabs--quiet': isQuiet},
        density ? `spectrum-Tabs--${density}` : '',
        className
      )}
      {...tabListProps}>
      {renderTabs()}
      {selectedTab &&
        <TabLine orientation={orientation} selectedTab={selectedTab} />
      }
    </div>
  );
}

function TabLine({orientation, selectedTab}) {
  // v3 clean this up a bit
  // Ideally this would be a DNA variable, but vertical tabs aren't even in DNA, soo...
  let verticalSelectionIndicatorOffset = 12;

  let style = {
    transform: orientation === 'vertical'
      ? `translateY(${selectedTab.offsetTop + verticalSelectionIndicatorOffset / 2}px)`
      : `translateX(${selectedTab.offsetLeft}px) `,
    width: undefined,
    height: undefined
  };

  if (orientation === 'horizontal') {
    style.width = `${selectedTab.offsetWidth}px`;
  } else {
    style.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
  }

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}

function findSelectedIndex(childArray, state) {
  return childArray.findIndex((child) =>
    child.props.value === state.selectedItem
  );
}
