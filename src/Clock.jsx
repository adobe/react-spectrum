import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import Textfield from './Textfield';
import { toMoment } from './utils/moment';

export default class Clock extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    valueFormat: PropTypes.string,
    displayFormat: PropTypes.string,
    quiet: PropTypes.bool,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    onChange: PropTypes.func
  };

  static defaultProps = {
    valueFormat: 'HH:mm',
    displayFormat: 'HH:mm',
    quiet: false,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    const { value, defaultValue, valueFormat } = this.props;

    this.state = {
      value: toMoment(value || defaultValue || 'today', valueFormat)
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        value: toMoment(nextProps.value, nextProps.valueFormat)
      });
    }
  }

  handleHourChange = e => {
    const { value } = this.state;
    e.stopPropagation();
    this.changeTime(parseInt(e.target.value, 10), value.minutes());
  }

  handleMinuteChange = e => {
    const { value } = this.state;
    e.stopPropagation();
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

    if (newTime !== value) {
      if (!('value' in this.props)) {
        this.setState({ value: newTime });
      }

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
          value={ value && value.format('HH') || '' }
          placeholder="HH"
          min="0"
          max="23"
          invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          required={ required }
          quiet={ quiet }
          onChange={ this.handleHourChange }
        />
        <span className="coral-Clock-divider">:</span>
        <Textfield
          ref="minute"
          className="coral-Clock-minute"
          type="number"
          value={ value && value.format('mm') || '' }
          placeholder="mm"
          min="0"
          max="59"
          invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          required={ required }
          quiet={ quiet }
          onChange={ this.handleMinuteChange }
        />
      </div>
    );
  }
}
