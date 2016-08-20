import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Textfield from './Textfield';

export default class Clock extends Component {
  static defaultProps = {
    quiet: false,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: () => {}
  };

  componentWillMount() {
    const { value, valueFormat } = this.props;

    this.setState({
      value: this.toMoment(value, valueFormat)
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value !== this.props.value &&
      nextProps.valueFormat !== this.props.valueFormat
    ) {
      this.setState({
        value: this.toMoment(nextProps.value, nextProps.valueFormat)
      });
    }
  }

  // TODO: Move to util?
  toMoment(value, format) {
    // if 'today'
    if (value === 'today') {
      return moment().startOf('day');
    }

    // If it's a moment object
    if (moment.isMoment(value)) {
      return value.isValid() ? value.clone() : null;
    }

    // Anything else
    const result = moment(value, value instanceof Date ? null : format);
    return result.isValid() ? result : null;
  }

  handleHourChange = e => {
    const { value } = this.state;
    this.changeTime(parseInt(e.target.value, 10), value.minutes());
  }

  handleMinuteChange = e => {
    const { value } = this.state;
    this.changeTime(value.hours(), parseInt(e.target.value, 10));
  }

  changeTime(hours, minutes) {
    const { valueFormat, onChange } = this.props;
    const { value } = this.state;

    let newTime = value.clone();

    if (isNaN(hours) || isNaN(minutes)) {
      newTime = '';
    } else {
      newTime.hours(hours);
      newTime.minutes(minutes);
    }

    if (newTime && newTime.isValid()) {
      if (!value.isSame(newTime, 'hour') || !value.isSame(newTime, 'minute')) {
        newTime.format(valueFormat);
      }
    }

    if (newTime !== value) {
      onChange(newTime.format(valueFormat), newTime.toDate());
    }
  }

  render() {
    const {
      quiet,
      disabled,
      invalid,
      readOnly,
      required,
      className,
      ...otherProps
    } = this.props;

    const { value } = this.state;

    return (
      <div
        className={
          classNames(
            'coral-Clock',
            className
          )
        }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-required={ required }
        { ...otherProps }
      >
        <Textfield
          ref="hour"
          className="coral-Clock-hour"
          type="number"
          value={ value.format('HH') }
          placeholder="HH"
          min="0"
          max="23"
          aria-invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          quiet={ quiet }
          onChange={ this.handleHourChange }
        />
        <span className="coral-Clock-divider">:</span>
        <Textfield
          ref="minute"
          className="coral-Clock-minute"
          type="number"
          value={ value.format('mm') }
          placeholder="mm"
          min="0"
          max="59"
          aria-invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          quiet={ quiet }
          onChange={ this.handleMinuteChange }
        />
      </div>
    );
  }
}
