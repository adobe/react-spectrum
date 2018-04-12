import Button from '../../Button';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import More from '../../Icon/core/More';
import React from 'react';
import '../style/index.styl';

export default function DropdownButton({alignRight, onClose, onOpen, onSelect, children, closeOnSelect, ...props}) {
  return (
    <Dropdown className="spectrum-ActionMenu" onClose={onClose} onOpen={onOpen} onSelect={onSelect} alignRight={alignRight} closeOnSelect={closeOnSelect}>
      <Button
        variant="action"
        quiet
        icon={<More className="spectrum-ActionMenu-icon" />}
        {...props} />
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
