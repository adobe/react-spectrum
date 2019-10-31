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

import autobind from 'autobind-decorator';
import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import Star from '../../Icon/core/Star';
import StarOutline from '../../Icon/core/StarOutline';

importSpectrumCSS('rating');

const formatMessage = messageFormatter(intlMessages);

@convertUnsafeMethod
@autobind
export default class Rating extends React.Component {
  static propTypes = {
    /**
     * Prevent interaction with component
     */
    disabled: PropTypes.bool,

    /**
     * Number of stars in rating.
     */
    max: PropTypes.number,

    /**
     * Prevents change from happening.
     */
    readOnly: PropTypes.bool,

    /**
     * Sets the rating (controlled).
     */
    value: PropTypes.number,

    /**
     * Default value for the rating (uncontrolled)
     */
    defaultValue: PropTypes.number,

    /**
     * Set an array of strings to communicate the value for accessibility.
     * By default, Rating announces the current value for accessibility
     * using a localized string for the number of stars,
     * for example, "4 Stars". This behavior can be overridden using a
     * custom array of strings, one for each star value,
     * including a string to represent "0 Stars" or "no value selected",
     * as the first string in the array.
     *
     * ```jsx
     *  <Rating
     *    valueTextStrings={[
     *      'No rating',
     *      '1 Star (Poor)',
     *      '2 Stars (Fair)',
     *      '3 Stars (Average)',
     *      '4 Stars (Good)',
     *      '5 Stars (Excellent)'
     *    ]} />
     * ```
     */
    valueTextStrings: PropTypes.arrayOf(PropTypes.string),

    /**
     * Callback for when the rating value changes
     */
    onChange: PropTypes.func,

   /**
    * Class given to rating
    */
    className: PropTypes.string,

    /**
     * ID of the rating.
     */
    id: PropTypes.string
  };

  static defaultProps = {
    disabled: false,
    className: '',
    max: 5
  };

  state = {
    currentRating: this.props.value || this.props.defaultValue || 0,
    focused: false
  };

  constructor(props) {
    super(props);
    this.inputId = createId();
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.value != null || props.defaultValue != null) {
      this.setState({
        currentRating: props.value || props.defaultValue || 0
      });
    }
  }

  onClickRating(currentRating, e) {
    e.stopPropagation();

    // Allow user to deselect current rating
    if (currentRating > 0 && currentRating === this.state.currentRating) {
      currentRating--;
    }

    if (this.props.value == null) {
      this.setState({currentRating});
    }

    if (this.props.onChange) {
      this.props.onChange(currentRating);
    }

    if (this.input) {
      this.input.focus();
    }
  }

  onInput(e) {
    const currentRating = +e.target.value;

    this.updateFocusedState();

    if (currentRating !== this.state.currentRating) {
      this.onClickRating(currentRating, e);
    }
  }

  onFocus(e) {
    this.updateFocusedState();
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  updateFocusedState() {
    if (this.input && !this.state.focused) {
      this.setState({'focused': this.input.classList.contains('focus-ring')});
    }
  }

  onBlur(e) {
    this.setState({'focused': false});
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  hasCorrespondingLabel() {
    return this.props.labelId !== undefined;
  }

  getAriaLabel() {
    if (this.props['aria-label']) {
      return this.props['aria-label'];
    }
    if (this.hasCorrespondingLabel()) {
      return null;
    }
    return formatMessage('Star Rating');
  }

  /**
   * Return a localized value text for a provided value,
   * for use as an `aria-valuetext` and as a `title`
   * attribute on rating icon stars.
   * @param   {Number} currentRating The rating for which to retrieve a text value
   * @returns {String} Localized value as text
   * @private
   */
  getValueText(currentRating) {
    let valueText = undefined;
    let {valueTextStrings, max} = this.props;

    // verify that valueTextStrings array is defined and is the appropriate length to provide a string for each star.
    if (valueTextStrings) {
      if (currentRating === max && valueTextStrings.length !== max + 1) {
        console.warn(`valueTextStrings length {${valueTextStrings.length}} does not match number of stars including a value for "0" or "none selected" {${max + 1}}.`);
      }
      valueText = valueTextStrings[currentRating];
    }
    return valueText || formatMessage('# star(s)', {currentRating});
  }

  render() {
    let {max, disabled, className, id = this.inputId, readOnly, quiet, style, ...otherProps} = this.props;
    let {currentRating, focused} = this.state;
    let ratings = [];

    for (let i = 1; i <= max; ++i) {
      let active = i <= Math.round(currentRating);
      let currentValue = i === Math.round(currentRating);

      ratings.push(
        <span
          key={i}
          className={classNames(
            'spectrum-Rating-icon',
            {
              'is-selected': active,
              'is-disabled': disabled,
              'is-readOnly': readOnly,
              'is-currentValue': currentValue
            }
          )}
          title={this.getValueText(i)}
          aria-hidden
          onClick={!disabled && !readOnly ? this.onClickRating.bind(this, i) : null}>
          <Star size={null} className="spectrum-Rating-starActive" />
          <StarOutline size={null} className="spectrum-Rating-starInactive" />
        </span>
      );
    }

    const ariaLabel = this.getAriaLabel();
    delete otherProps['aria-label'];

    return (
      <div
        className={classNames(
          'spectrum-Rating',
          {
            'is-disabled': disabled,
            'is-readOnly': readOnly,
            'is-focused': focused,
            'spectrum-Rating--quiet': quiet
          },
          className
        )}
        style={{...style, width: `${24 * max}px`}}>
        <input
          ref={i => this.input = i}
          id={id}
          className="spectrum-Rating-input"
          type="range"
          min={0}
          max={max}
          value={currentRating}
          aria-valuetext={this.getValueText(currentRating)}
          aria-label={ariaLabel}
          style={{...style, width: `${24 * max}px`}}
          disabled={disabled}
          readOnly={readOnly}
          onInput={!disabled && !readOnly ? this.onInput : null}
          {...filterDOMProps(otherProps)}
          /* prevent onChange from executing twice with keyboard input */
          onChange={!disabled && !readOnly ? () => {} : null}
          onFocus={!disabled ? this.onFocus : null}
          onBlur={!disabled ? this.onBlur : null} />
        {ratings}
      </div>
    );
  }
}
