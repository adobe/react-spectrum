import AccordionChevron from '../../Icon/core/AccordionChevron';
import classNames from 'classnames';
import createId from '../../utils/createId';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
@focusRing
export default class AccordionItem extends Component {
  static propTypes = {
    header: PropTypes.string,
    selected: PropTypes.bool,
    disabled: PropTypes.bool,
    ariaLevel: PropTypes.number,
    onItemClick: PropTypes.func
  };

  static defaultProps = {
    header: '',
    selected: false,
    disabled: false,
    ariaLevel: 3,
    onItemClick() {}
  };

  constructor(props) {
    super(props);
    this.headerId = createId();
    this.contentId = createId();
  }

  onHeaderKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
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
      disabled,
      ariaLevel,
      tabIndex = 0,
      ...otherProps
    } = this.props;

    return (
      <div
        {...otherProps}
        className={
          classNames(
            'spectrum-Accordion-item',
            {'is-open': selected, 'is-disabled': disabled},
            className
          )
        }
        role="presentation">
        <div
          id={this.headerId}
          className="spectrum-Accordion-header"
          aria-controls={this.contentId}
          aria-selected={selected}
          aria-expanded={selected}
          aria-disabled={disabled}
          role="tab"
          tabIndex={disabled ? undefined : tabIndex}
          onClick={disabled ? undefined : onItemClick}
          onKeyPress={disabled ? undefined : this.onHeaderKeyPress.bind(this)}>
          <span role="heading" aria-level={ariaLevel}>
            {header}
          </span>
        </div>
        <AccordionChevron size={null} className="spectrum-Accordion-indicator" />
        <div
          id={this.contentId}
          role="tabpanel"
          aria-labelledby={this.headerId}
          aria-hidden={!selected}
          aria-expanded={selected}
          className="spectrum-Accordion-content">
          {children}
        </div>
      </div>
    );
  }
}
