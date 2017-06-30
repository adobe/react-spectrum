import React, {Component} from 'react';
import classNames from 'classnames';
import createId from '../../utils/createId';
import Icon from '../../Icon';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class Tab extends Component {
  static displayName = 'Tab';

  static defaultProps = {
    id: createId(),
    invalid: false,
    disabled: false,
    selected: false,
    tabIndex: '0'
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
      tabIndex,
      ...otherProps
    } = this.props;

    return (
      <div
        {...otherProps}
        className={
          classNames(
            'coral-Tab',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid
            },
            className
          )
        }
        id={id}
        tabIndex={tabIndex}
        role="tab"
        selected={selected}
        disabled={disabled}
        aria-invalid={invalid}
        aria-selected={selected}
        aria-disabled={disabled}
        onClick={this.handleClick}
      >
        <span className="coral-Tab-label">
          {icon ? <Icon icon={icon} size="S" /> : null}
          {label || children}
        </span>
      </div>
    );
  }
}
