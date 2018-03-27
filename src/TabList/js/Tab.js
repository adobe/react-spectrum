import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import createId from '../../utils/createId';
import focusRing from '../../utils/focusRing';
import React, {Component} from 'react';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
@focusRing
@autobind
export default class Tab extends Component {
  static displayName = 'Tab';

  static defaultProps = {
    invalid: false,
    disabled: false,
    selected: false,
    renderChildren: true
  };

  constructor(props) {
    super(props);
    this.tabId = createId();
  }

  handleClick = e => {
    if (!this.props.disabled && this.props.onClick) {
      this.props.onClick(e);
    }
  }

  handleKeyPress = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick(e);
    }
  }

  render() {
    const {
      id = this.tabId,
      label,
      children,
      className,
      selected,
      disabled,
      invalid,
      icon,
      renderChildren, // Temporary, will be removed in next major version bump
      tabIndex = 0,
      ...otherProps
    } = this.props;

    let iconSize = label || (renderChildren && children) ? 'XS' : 'S';

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
        aria-selected={selected}
        aria-invalid={invalid || null}
        aria-disabled={disabled || null}
        tabIndex={!disabled ? tabIndex : null}
        onClick={!disabled ? this.handleClick : null}
        onKeyPress={!disabled ? this.handleKeyPress : null}>
        {cloneIcon(icon, {size: iconSize, className: 'spectrum-TabList-item-icon'})}
        {(label || (renderChildren && children)) && <span className="spectrum-TabList-item-label">{label || (renderChildren && children)}</span>}
      </div>
    );
  }
}
