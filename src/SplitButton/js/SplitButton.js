import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default function SplitButton({className, onSelect, children, ...props}) {
  return (
    <Dropdown className={classNames('coral-SplitButton', className)} alignRight onSelect={onSelect}>
      <Button {...props} className="coral-SplitButton-action" />
      <Button
        variant={props.variant}
        className="coral-SplitButton-trigger"
        dropdownTrigger>
        <Icon icon="chevronDown" size="XS" />
      </Button>
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
