import Button from '../../Button';
import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default function DropdownButton({alignRight, onSelect, children, noArrow, ...props}) {
  return (
    <Dropdown className="coral-DropdownButton" onSelect={onSelect} alignRight={alignRight}>
      <Button {...props}>
        {!noArrow && <Icon icon="chevronDown" size="XS" className="coral-DropdownButton-arrow" />}
      </Button>
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
