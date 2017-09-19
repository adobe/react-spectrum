import classNames from 'classnames';
import createId from '../../utils/createId';
import React, {Component} from 'react';

/**
 * header: A string or node which will be placed at the top of the accordion item.
 */
export default class AccordionItem extends Component {
  static propTypes = {
    header: React.PropTypes.string,
    selected: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    onItemClick: React.PropTypes.func
  };

  static defaultProps = {
    header: '',
    selected: false,
    disabled: false,
    onItemClick() {}
  };

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
      disabled,
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
          onClick={onItemClick}
          aria-controls={this.contentId}
          aria-selected={selected}
          aria-expanded={selected}
          aria-disabled="false"
          tabIndex="0"
          onKeyPress={this.onHeaderKeyDown.bind(this)}>
          {header}
        </div>
        <div
          id={this.contentId}
          role="tabpanel"
          aria-labelledby={this.headerId}
          aria-hidden={!selected}
          className="spectrum-Accordion-content">
          {children}
        </div>
      </div>
    );
  }
}
