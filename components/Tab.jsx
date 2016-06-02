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
      onItemClick,
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
            className
          )
        }
        onClick={onItemClick}
        id={this.tabId}
        role='tab'
        aria-selected={selected}
        selected={selected}
        aria-invalid='false'
        aria-disabled='false'
        tabIndex={tabIndex}
      >
        { icon ? <Icon icon={icon} size="S"/> : null }
        <span className="coral3-Accordion-label">{children}</span>
      </div>
    );
  }
}

Tab.defaultProps = {
  onItemClick() {}
};
