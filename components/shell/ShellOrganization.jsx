import React from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

import './ShellOrganization.styl';

export default ({
  selected = false,
  label,
  isSubItem,
  icon = isSubItem ? 'adobeTarget' : undefined,
  className,
  children,
  ...otherProps
}) => (
  <div
    className={
      classNames(
        'coral-BasicList-item',
        `coral-Shell-orgSwitcher-${ isSubItem ? 'sub' : '' }item`,
        { 'is-selected': selected },
        className
      )
    }
    role="button"
    selected={ selected }
    { ...otherProps }
  >
    {
      icon &&
      <Icon className="coral-BasicList-item-icon" icon={ icon } size={ isSubItem ? 'S' : 'M' } />
    }
    <div className="coral-BasicList-item-outerContainer">
      <div className="coral-BasicList-item-contentContainer">
        <coral-list-item-content className="coral-BasicList-item-content">
          { label }
        </coral-list-item-content>
      </div>
    </div>
    {
      selected &&
      <Icon className="coral-Shell-orgSwitcher-item-checkmark" icon="checkmark" />
    }
    {
      children && !isSubItem &&
      <div className="coral-Shell-orgSwitcher-subitems">
        { children }
      </div>
    }
  </div>
)
