import React, { Component } from 'react';
import classNames from 'classnames';
import createId from './utils/createId';
import Icon from './Icon';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class Tab extends Component {
  constructor(props) {
    super(props);
    this.tabId = createId();
  }

  handleClick = e => {
    if (!this.props.disabled) {
      this.props.onClick(e);
    }
  }

  render() {
    const {
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
        { ...otherProps }
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
        tabIndex={ tabIndex || '0' }
        id={ this.tabId }
        role="tab"
        selected={ selected }
        disabled={ disabled }
        aria-invalid={ invalid }
        aria-selected={ selected }
        aria-disabled={ disabled }
        onClick={ this.handleClick }
      >
        { icon ? <Icon icon={ icon } size="S" /> : null }
        <span className="coral-Tab-label">{ children }</span>
      </div>
    );
  }
}

Tab.defaultProps = {
  disabled: false,
  onClick() {}
};

Tab.displayName = 'Tab';
