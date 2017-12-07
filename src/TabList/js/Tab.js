import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import createId from '../../utils/createId';
import React, {Component} from 'react';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class Tab extends Component {
  static displayName = 'Tab';

  static defaultProps = {
    id: createId(),
    invalid: false,
    disabled: false,
    selected: false
  };

  handleClick = e => {
    if (!this.props.disabled) {
      this.props.onClick(e);
    }
  }

  render() {
    const {
      id,
      label,
      children,
      className,
      selected,
      disabled,
      invalid,
      icon,
      ...otherProps
    } = this.props;

    let iconSize = label || children ? 'XS' : 'S';

    return (
      <div
        {...otherProps}
        className={
          classNames(
            'spectrum-TabList-item',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid
            },
            className
          )
        }
        id={id}
        role="tab"
        selected={selected}
        disabled={disabled}
        aria-invalid={invalid}
        aria-selected={selected}
        aria-disabled={disabled}
        onClick={this.handleClick}>
        {cloneIcon(icon, {size: iconSize, className: 'spectrum-TabList-item-icon'})}
        {(label || children) && <span className="spectrum-TabList-item-label">{label || children}</span>}
      </div>
    );
  }
}
