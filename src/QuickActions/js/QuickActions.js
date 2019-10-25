import ButtonGroup from '../../ButtonGroup';
import classNames from 'classnames';
import DropdownButton from '../../DropdownButton';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import {QuickActionsItem} from './QuickActionsItem';
import React, {cloneElement} from 'react';

importSpectrumCSS('quickaction');

function cloneItem(item, variant, isMenuItem) {
  const props = {
    key: item.props.label,
    ...item.props,
    label: variant === 'icon' ? undefined : item.props.label,
    icon: variant === 'text' ? undefined : item.props.icon,
    isMenuItem: isMenuItem
  };

  return cloneElement(item, props);
}

export function QuickActions({className, maxVisibleItems, onMenuOpen, onMenuClose, isOpen, style, variant, orientation, manageTabIndex, readOnly, ...otherProps}) {
  const cssClasses = classNames(
    'spectrum-QuickActions',
    {'is-open': isOpen},
    {'spectrum-QuickActions--textOnly': variant === 'text'},
    className
  );

  let quickActions = React.Children.toArray(otherProps.children);
  let hasDropdown = quickActions.length > maxVisibleItems;

  return (
    <ButtonGroup
      {...filterDOMProps(otherProps)}
      role="menu"
      className={cssClasses}
      orientation={orientation}
      manageTabIndex={manageTabIndex}
      readOnly={readOnly}
      aria-hidden={!isOpen || null}>
      {
        hasDropdown &&
        quickActions.slice(0, maxVisibleItems).map(item => cloneItem(item, variant, false))
      }
      {
        hasDropdown &&
        (<DropdownButton className={`spectrum-${QuickActionsItem.displayName}`} onOpen={onMenuOpen} onClose={onMenuClose} alignRight>
          {
            quickActions.slice(maxVisibleItems, quickActions.length)
              .map(item => cloneItem(item, variant, true))
          }
        </DropdownButton>)
      }
      {
        !hasDropdown &&
         quickActions.map(item => cloneItem(item, variant, false))
      }
    </ButtonGroup>
  );
}

QuickActions.displayName = 'QuickActions';

const quickActionsItemType = PropTypes.shape({
  type: PropTypes.oneOf([QuickActionsItem])
});

QuickActions.propTypes = {
  /**
   * One or more QuickActionsItem elements.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(quickActionsItemType),
    quickActionsItemType
  ]).isRequired,
  /**
   * Custom className to apply to this component.
   */
  className: PropTypes.string,
  /**
   * Number of quickaction buttons that can be visible before wrapping inside a dropdown.
   */
  maxVisibleItems: PropTypes.number,
  /**
   * Whether the quickactions are displayed or not.
   */
  isOpen: PropTypes.bool,
  /**
   * Specifies whether to show icon only or text only quickaction buttons.
   */
  variant: PropTypes.oneOf(['icon', 'text']),
  /**
   * Renders the button group as a row or a column.
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical', 'both']),
  /**
   * Whether to use roving tabIndex so that only one element within the quickaction can receive focus with tab key at a time.
   */
  manageTabIndex: PropTypes.bool,
  /**
   * Won't allow a permanent selection.
   */
  readOnly: PropTypes.bool,
  /**
   * Triggers when the ... menu opens.
   */
  onMenuOpen: PropTypes.func,
  /**
   * Triggers when the ... menu closes.
   */
  onMenuClose: PropTypes.func
};

QuickActions.defaultProps = {
  manageTabIndex: false,
  maxVisibleItems: 2,
  orientation: 'horizontal',
  readOnly: true

};
