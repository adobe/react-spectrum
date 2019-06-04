import {classNames} from '@react-spectrum/utils/src/classNames';
import filterDOMProps from '@react-spectrum/utils/src/filterDOMProps';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {useTab} from '@react-aria/tabs';

interface TabProps extends React.HTMLAttributes<HTMLElement> {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
  onSelect?: () => void  // Override React.HTMLAttributes onSelect 
}

export function Tab(props: TabProps) {
  // v3 come up with rule for how to handle props and dom props issue
  // v3 Always use classNames even when only one class because of modules and "turnonclassname" option
  // TODO: Add in icon in the render when cloneIcon/icon v3 becomes available. Make it so icon or label must be defined.
  let {label, isDisabled, icon, value, ...otherProps} = props;
  let {tabProps} = useTab(props);
  return (
    <div
      {...filterDOMProps(otherProps)}
      {...tabProps}
      className={classNames(
        styles,
        'spectrum-Tabs-item',
        {
          'is-selected': tabProps['aria-selected'],
          'is-disabled': isDisabled
        },
        otherProps.className
      )}>
      {label && <span className={classNames(styles, 'spectrum-Tabs-itemLabel')}>{label}</span>}
    </div>
  );

}
