import React from 'react';
import classNames from 'classnames';
import createId from './utils/createId';
import Icon from './Icon';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class Tab extends React.Component {
  constructor(props) {
    super(props);
    this.tabId = createId();
  }

  render() {
    const {
      children,
      className,
      selected,
      disabled,
      onClick,
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
            selected ? 'is-selected' : null,
            disabled ? 'is-disabled' : null,
            className
          )
        }
        onClick={onClick}
        id={this.tabId}
        role='tab'
        aria-invalid={false}
        selected={selected}
        aria-selected={selected}
        disabled={disabled}
        aria-disabled={disabled}
        tabIndex={tabIndex || '0'}
      >
        { icon ? <Icon icon={icon} size="S"/> : null }
        <span className="coral-Tab-label">{children}</span>
      </div>
    );
  }
}

Tab.defaultProps = {
  disabled: false,
  onClick() {}
};
