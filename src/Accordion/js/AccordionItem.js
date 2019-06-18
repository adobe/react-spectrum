/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

/**
 * An AccordionItem component represents an item in an accordion
 */
@focusRing
export default class AccordionItem extends Component {
  static propTypes = {
    /**
     * A string or node which will be placed at the top of the accordion item.
     */
    header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),

    /**
     * Whether or not the accordion item is selected. Causes the item to expand.
     */
    selected: PropTypes.bool,

    /**
     * Disables the accordion item, making it grey and uninteractable.
     */
    disabled: PropTypes.bool,

    /**
     * The aria heading level of the AccordionItem. Defines the elements position
     * within a hierarchy. Set by ariaLevel prop in the parent Accordion
     * rather than directly on the component itself.
     */
    ariaLevel: PropTypes.number,

    /**
     * The behavior executed upon click on the AccordionItem. Set by the parent Accordion component.
     */
    onItemClick: PropTypes.func
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

  render() {
    const {
      children,
      className,
      onItemClick,
      header,
      selected,
      disabled,
      ariaLevel,
      ...otherProps
    } = this.props;

    return (
      <div
        {...filterDOMProps(otherProps)}
        className={
          classNames(
            'spectrum-Accordion-item',
            'react-spectrum-Accordion-item',
            {'is-open': selected, 'is-disabled': disabled},
            className
          )
        }
        role="presentation">
        <h3
          className="spectrum-Accordion-itemHeading"
          aria-level={ariaLevel}>
          <button
            id={this.headerId}
            className="spectrum-Accordion-itemHeader"
            aria-controls={this.contentId}
            aria-expanded={selected}
            disabled={disabled}
            type="button"
            onClick={!disabled ? onItemClick : null}>
            {header}
          </button>
          <ChevronRightMedium role="presentation" size={null} className="spectrum-Accordion-itemIndicator" />
        </h3>
        <div
          id={this.contentId}
          role="region"
          aria-labelledby={this.headerId}
          aria-hidden={!selected}
          aria-expanded={selected}
          className="spectrum-Accordion-itemContent">
          {selected ? children : null}
        </div>
      </div>
    );
  }
}
