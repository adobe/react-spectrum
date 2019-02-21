import Button from '../../Button';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import More from '../../Icon/More';
import PropTypes from 'prop-types';
import React from 'react';

export default function DropdownButton({alignRight, onClose, onOpen, onSelect, children, closeOnSelect, menuClassName, ...props}) {
  return (
    <Dropdown style={{display: 'inline-block'}} onClose={onClose} onOpen={onOpen} onSelect={onSelect} alignRight={alignRight} closeOnSelect={closeOnSelect}>
      <Button
        variant="action"
        quiet
        icon={<More alt="…" />}
        {...props} />
      <Menu
        className={menuClassName}>
        {children}
      </Menu>
    </Dropdown>
  );
}

DropdownButton.propTypes = {
  /**
   * If true, dropdown will close on selection of an item
   */
  closeOnSelect: PropTypes.bool,

  /**
   * Callback for when the dropdown is opened
   */
  onOpen: PropTypes.func,

  /**
   * Callback for when the dropdown is closed
   */
  onClose: PropTypes.func,

  /**
   * Callback for when an item is selected from the dropdown
   */
  onSelect: PropTypes.func,

  /**
   * Aligns the dropdown to the right or left of the button opening the dropdown
   */
  alignRight: PropTypes.bool,

  /**
   * Custom classname to apply to the Menu
   */
  menuClassName: PropTypes.bool
};
