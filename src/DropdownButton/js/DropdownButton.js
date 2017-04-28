import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default function DropdownButton({className, onSelect, children, noArrow, ...props}) {
  return (
    <Dropdown className={classNames('coral-DropdownButton', className)} onSelect={onSelect}>
      <Button {...props}>
        {!noArrow && <Icon icon="chevronDown" size="XS" className="coral-DropdownButton-arrow" />}
      </Button>
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
