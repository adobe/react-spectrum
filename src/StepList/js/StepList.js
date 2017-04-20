import React from 'react';
import classNames from 'classnames';

import TabListBase from '../../TabList/js/TabListBase';

import '../style/index.styl';

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
      { ...otherProps }
      className={
        classNames(
          'coral-StepList',
          {
            'coral-StepList--interactive': interaction === ON,
            'coral-StepList--small': size === SMALL
          },
          className
        )
      }
      disabled={ interaction !== ON }
      aria-multiselectable={ false }
      childMappingFunction={ (...args) => getChildProps(size, ...args) }
    />
  );
}

function getChildProps(size, tabList, child, index) {
  return {
    complete: +tabList.state.selectedIndex > index,
    size
  };
}

StepList.displayName = 'StepList';
