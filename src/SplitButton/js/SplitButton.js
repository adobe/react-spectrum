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
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      if (e.altKey || e.target === ReactDOM.findDOMNode(this.dropdownRef.triggerRef)) {
        e.preventDefault();
        this.dropdownRef.overlayTrigger.show(e);
      }
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
  /** Class to add to the SplitButton */
  className: PropTypes.string,

  /** Function to trigger once button is selected */
  onSelect: PropTypes.func,

  /** SplitButton variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'cta'])
};
