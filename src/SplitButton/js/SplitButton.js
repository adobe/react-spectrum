/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import Button from '../../Button';
import ChevronDownMedium from '../../Icon/core/ChevronDownMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import Dropdown from '../../Dropdown';
import filterDOMProps from '../../utils/filterDOMProps';
import {Menu} from '../../Menu';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('splitbutton');

@autobind
export default class SplitButton extends React.Component {
  constructor(props) {
    super(props);
    this.buttonId = createId();
  }

  onKeyDown(e) {
    if ((e.key === 'ArrowDown' || e.key === 'Down') &&
      (e.altKey || e.target === ReactDOM.findDOMNode(this.dropdownRef.triggerRef))) {
      e.preventDefault();
      e.stopPropagation();
      this.dropdownRef.overlayTrigger.show(e);
    }
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  }

  render() {
    const {
      children,
      className,
      id = this.buttonId,
      onSelect,
      onOpen,
      onClose,
      variant,
      disabled,
      ...otherProps
    } = this.props;

    return (
      <Dropdown ref={d => this.dropdownRef = d} className={classNames('spectrum-SplitButton', className)} alignRight onSelect={onSelect} onOpen={onOpen} onClose={onClose} onKeyDown={this.onKeyDown} role="group" aria-labelledby={id}>
        <Button
          variant={variant}
          {...filterDOMProps(otherProps)}
          disabled={disabled}
          className="spectrum-SplitButton-action"
          id={id} />
        <Button
          variant={variant}
          className="spectrum-SplitButton-trigger"
          aria-labelledby={id}
          disabled={disabled}
          dropdownTrigger>
          <ChevronDownMedium size={null} className="spectrum-SplitButton-icon" />
        </Button>
        <Menu aria-labelledby={id}>
          {children}
        </Menu>
      </Dropdown>
    );
  }
}

SplitButton.propTypes = {
  /** Items to render as dropdown menu items. MenuItem components are commonly used here. */
  children: PropTypes.node,

  /** Function to trigger once button is selected. */
  onSelect: PropTypes.func,

  /** Function to trigger when the button dropdown menu opens. */
  onOpen: PropTypes.func,

  /** Function to trigger when the button dropdown menu closes. */
  onClose: PropTypes.func,

  /** SplitButton variant to render. */
  variant: PropTypes.oneOf(['primary', 'secondary', 'cta'])
};
