import Button from '../../Button';
import classNames from 'classnames';
import {MenuItem} from '../../Menu';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A quick actions item
 */
export function QuickActionsItem({className, icon, label, onClick, isMenuItem, 'aria-label': ariaLabel, ...otherProps}) {
  return (
    isMenuItem
      ? <MenuItem
        {...otherProps}
        className={`spectrum-${QuickActionsItem.displayName}`}
        icon={icon}
        onClick={onClick}
        aria-label={ariaLabel}>{label}</MenuItem>
      : <Button
        {...otherProps}
        className={classNames(
          className,
          `spectrum-${QuickActionsItem.displayName}`
        )}
        variant="action"
        quiet
        icon={icon}
        label={icon ? undefined : label}
        aria-label={icon ? (ariaLabel || label) : ariaLabel}
        onClick={onClick}
        role="menuitem" />
  );
}

QuickActionsItem.displayName = 'QuickActionsItem';

QuickActionsItem.propTypes = {
  /**
   * Custom className to apply to this component.
   */
  className: PropTypes.string,
  /**
   * An icon to render in the quick actions item.
   */
  icon: PropTypes.element,
  /**
   * The label to display in the quick actions item.
   */
  label: PropTypes.string.isRequired,
  /**
   * Callback for when the quick action item is clicked.
   */
  onClick: PropTypes.func
};
