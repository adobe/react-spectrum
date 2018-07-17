import Button from '../../Button';
import ChevronDownMedium from '../../Icon/core/ChevronDownMedium';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import React from 'react';

importSpectrumCSS('splitbutton');

export default function SplitButton({className, onSelect, children, ...props}) {
  return (
    <Dropdown className={classNames('spectrum-SplitButton', className)} alignRight onSelect={onSelect}>
      <Button {...props} className="spectrum-SplitButton-action" />
      <Button
        variant={props.variant}
        className="spectrum-SplitButton-trigger"
        dropdownTrigger>
        <ChevronDownMedium size={null} className="spectrum-SplitButton-icon" />
      </Button>
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
