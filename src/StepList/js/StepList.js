import classNames from 'classnames';
import React from 'react';
import TabListBase from '../../TabList/js/TabListBase';

importSpectrumCSS('steplist');

const SMALL = 'S';
const LARGE = 'L';
const ON = 'on';

export default function StepList({
  className,
  interaction = ON,
  size = LARGE,
  ...otherProps
}) {
  return (
    <TabListBase
      {...otherProps}
      className={
        classNames(
          'spectrum-Steplist',
          {
            'spectrum-Steplist--interactive': interaction === ON,
            'spectrum-Steplist--small': size === SMALL
          },
          className
        )
      }
      disabled={interaction !== ON}
      aria-multiselectable={false}
      childMappingFunction={(...args) => getChildProps(size, ...args)} />
  );
}

function getChildProps(size, tabList, child, index) {
  return {
    complete: +tabList.state.selectedIndex > index,
    size
  };
}

StepList.displayName = 'StepList';
