import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default function SplitButton({className, onSelect, children, ...props}) {
  return (
    <Dropdown className={classNames('spectrum-SplitButton', className)} alignRight onSelect={onSelect}>
      <Button {...props} className="spectrum-SplitButton-action" />
      <Button
        variant={props.variant}
        className="spectrum-SplitButton-trigger"
        dropdownTrigger />
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
