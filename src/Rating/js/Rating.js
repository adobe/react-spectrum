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
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';
import Star from '../../Icon/core/Star';
import StarOutline from '../../Icon/core/StarOutline';

importSpectrumCSS('rating');

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
    value: PropTypes.number
  };

  static defaultProps = {
    disabled: false,
    className: '',
    max: 5
  };

  state = {
    currentRating: this.props.value || 0,
    currentFocus: null
  };

  constructor(props) {
    super(props);
    this.inputId = createId();
  }

  componentWillReceiveProps(props) {
    if (props.value != null) {
      this.setState({
        currentRating: props.value || 0
      });
    }
  }

  onClickRating(currentRating, e) {
    e.stopPropagation();

    // Allow user to set rating to zero.
    if (currentRating === 1 && this.state.currentRating === 1) {
      currentRating = 0;
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

    if (currentRating !== this.state.currentRating) {
      this.onClickRating(currentRating, e);
    }
  }

  render() {
    let {max, disabled, className, id = this.inputId, ...otherProps} = this.props;
    let {currentRating} = this.state;
    let ratings = [];

    for (let i = 1; i <= max; ++i) {
      let active = i <= Math.round(currentRating);
      let currentValue = i === Math.round(currentRating);

      ratings.push(
        <span
          key={i}
          className={classNames('spectrum-Rating-icon', {'is-selected': active, 'is-disabled': disabled, 'is-currentValue': currentValue})}
          onClick={!disabled ? this.onClickRating.bind(this, i) : null}
          onKeyDown={!disabled ? () => {} : null}>
          <Star size={null} className="spectrum-Rating-starActive" />
          <StarOutline size={null} className="spectrum-Rating-starInactive" />
        </span>
      );
    }

    return (
      <div
        className={classNames('spectrum-Rating', {'is-disabled': disabled}, className)}>
        <input
          ref={i => this.input = i}
          id={id}
          className="spectrum-Rating-input"
          type="range"
          min={0}
          max={max}
          value={currentRating}
          style={{width: (24 * max) + 'px'}}
          disabled={disabled || null}
          onInput={!disabled ? this.onInput.bind(this) : null}
          {...filterDOMProps(otherProps)} />
        {ratings}
      </div>
    );
  }
}
