import {classNames} from '@react-spectrum/utils/src/classNames';
import filterDOMProps from '@react-spectrum/utils/src/filterDOMProps';
import React, {useEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {useTabList} from '@react-aria/tablist';
import {useTabListState} from '@react-stately/tablist';

export function TabList(props) {
  let state = useTabListState(props);
  let [tabsArray, setTabsArray] = useState([]);
  let {tabListProps} = useTabList(props, state);
  let ref = useRef();
  useEffect(() => {
    let tabs = ref.current.querySelectorAll('.' + styles['spectrum-Tabs-item']); // v3 what do we with these?
    setTabsArray(tabs);
  },[props.children]);

  /** Defaults **/
  let {
    orientation = 'horizontal',
    quiet = false,
    variant = '',
    className,
    ...otherProps
  } = props;

  let renderTabs = () => {
    return React.Children.toArray(props.children).map((child, index) =>
      child ? React.cloneElement(child, {
        selected: state.selectedIndex === index,
        onSelect: () => state.setSelectedIndex(index)
      }) : null
    );
  };

  let selectedTab = tabsArray[state.selectedIndex];

  return (
    <div
      ref={ref}
      {...filterDOMProps(otherProps)}
      className={classNames(
        styles,
        'spectrum-Tabs',
        `spectrum-Tabs--${orientation}`,
        {'spectrum-Tabs--quiet': quiet},
        variant ? `spectrum-Tabs--${variant}` : '',
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
      : `translateX(${selectedTab.offsetLeft}px) `
  };

  if (orientation === 'horizontal') {
    style.width = `${selectedTab.offsetWidth}px`;
  } else {
    style.height = `${selectedTab.offsetHeight - verticalSelectionIndicatorOffset}px`;
  }

  return <div className={classNames(styles, 'spectrum-Tabs-selectionIndicator')} role="presentation" style={style} />;
}

