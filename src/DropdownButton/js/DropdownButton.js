import Button from '../../Button';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import More from '../../Icon/More';
import React from 'react';

export default function DropdownButton({alignRight, onClose, onOpen, onSelect, children, closeOnSelect, menuClassName, ...props}) {
  return (
    <Dropdown onClose={onClose} onOpen={onOpen} onSelect={onSelect} alignRight={alignRight} closeOnSelect={closeOnSelect}>
      <Button
        variant="action"
        quiet
        icon={<More />}
        {...props} />
      <Menu className={menuClassName}>
        {children}
      </Menu>
    </Dropdown>
  );
}
