import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default function DropdownButton({alignRight, onSelect, children, ...props}) {
  return (
    <Dropdown className="spectrum-ActionMenu" onSelect={onSelect} alignRight={alignRight}>
      <Button
        variant="action"
        quiet
        {...props}
        className={classNames('spectrum-ActionMenu-button', props.className)} />
      <Menu>
        {children}
      </Menu>
    </Dropdown>
  );
}
