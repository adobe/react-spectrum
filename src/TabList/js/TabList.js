import classNames from 'classnames';
import React from 'react';
import TabListBase from './TabListBase';
import '../style/index.styl';

/**
 * selectedIndex: The index of the Tab that should be selected (open). When selectedIndex is
 * specified, the component is in a controlled state and a Tab can only be selected by changing the
 * selectedIndex prop value. By default, the first Tab will be selected.
 *
 * defaultSelectedIndex: The same as selectedIndex except that the component is in an uncontrolled
 * state.
 *
 * onChange: A function that will be called when an Tab is selected or deselected. It will be passed
 * the updated selected index.
 */
export default function TabList({
  className,
  size = 'M',
  orientation = 'horizontal',
  anchored,
  ...otherProps
}) {
  return (
    <TabListBase
      {...otherProps}
      className={
        classNames(
          'spectrum-TabList',
          size === 'L' ? 'spectrum-TabList--large' : '',
          `spectrum-TabList--${orientation}`,
          {'spectrum-TabList--anchored': anchored},
          className
        )
      }
    />
  );
}

TabList.displayName = 'TabList';
