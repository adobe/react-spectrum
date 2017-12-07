import Button from '../../Button';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import More from '../../src/Icon/core/More';
import React from 'react';
import '../style/index.styl';

export default function DropdownButton({alignRight, onSelect, children, ...props}) {
  return (
    <Dropdown className="spectrum-ActionMenu" onSelect={onSelect} alignRight={alignRight}>
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
