import React, { Component } from 'react';
import classNames from 'classnames';
import Icon from './Icon';
import createId from './utils/createId';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class AccordionItem extends Component {
  constructor(props) {
    super(props);
    this.headerId = createId();
    this.contentId = createId();
  }

  onHeaderKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.props.onItemClick();
    }
  }

  render() {
    const {
      children,
      className,
      onItemClick,
      header,
      selected,
      ...otherProps
    } = this.props;

    return (
      <div
        { ...otherProps }
        className={
          classNames(
            'coral3-Accordion-item',
            className
          )
        }
        role="presentation"
      >
        <div
          id={ this.headerId }
          className="coral3-Accordion-header"
          onClick={ onItemClick }
          aria-controls={ this.contentId }
          aria-selected={ selected }
          aria-expanded={ selected }
          aria-disabled="false"
          tabIndex="0"
          onKeyPress={ this.onHeaderKeyDown.bind(this) }
        >
          <Icon icon={ selected ? 'chevronDown' : 'chevronRight' } size="XS" />
          <span className="coral3-Accordion-label">{ header }</span>
        </div>
        <div
          id={ this.contentId }
          role="tabpanel"
          aria-labelledby={ this.headerId }
          aria-hidden={ !selected }
          className="coral3-Accordion-content"
          style={ { display: selected ? 'block' : 'none' } }
        >
          { children }
        </div>
      </div>
    );
  }
}

AccordionItem.defaultProps = {
  selected: false,
  onItemClick() {}
};
