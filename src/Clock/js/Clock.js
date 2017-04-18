import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import classNames from 'classnames';

import Textfield from '../../Textfield';
import {toMoment, formatMoment} from '../../utils/moment';
import {clamp} from '../../utils/number';

import '../style/index.styl';

export default class Clock extends Component {
  static displayName = 'Clock';

  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    valueFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
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
    onChange: function () {}
  };

  constructor(props) {
    super(props);

    const {value, defaultValue, valueFormat} = this.props;

    const val = toMoment(value || defaultValue || '', valueFormat);
    const isValid = val && val.isValid();

    this.state = {
      value: val,
      hourText: isValid ? val.format('HH') : '',
      minuteText: isValid ? val.format('mm') : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const val = toMoment(nextProps.value, nextProps.valueFormat);
      const isValid = val && val.isValid();

      if (!isValid) {
        this.setState({
          hourText: this.state.hourText || '',
          minuteText: this.state.minuteText || ''
        });
      } else {
        if (!this.state.hourText || +this.state.hourText !== val.hour()) {
          this.setState({hourText: val.hour()});
        }

        if (!this.state.minuteText || +this.state.minuteText !== val.minute()) {
          this.setState({minuteText: val.minute()});
        }
      }

      this.setState({
        value: val
      });
    }
  }

  handleHourChange = e => {
    const {minuteText} = this.state;
    e.stopPropagation();
    this.changeTime(e.target.value, minuteText);
  }

  handleMinuteChange = e => {
    const {hourText} = this.state;
    e.stopPropagation();
    this.changeTime(hourText, e.target.value);
  }

  handleHourBlur = e => {
    let val = e.target.value;

    // normalize the hourText displayed in the input
    if (val.length <= 1) {
      val = `0${ val }`;
    }

    this.setState({
      hourText: val
    });
  }

  handleMinuteBlur = e => {
    let val = e.target.value;

    // normalize the minuteText displayed in the input
    if (val.length <= 1) {
      val = `0${ val }`;
    }

    this.setState({
      minuteText: val
    });
  }

  changeTime(hourText, minuteText) {
    const {valueFormat, onChange} = this.props;
    const {value} = this.state;

    const hours = parseInt(hourText, 10);
    const minutes = parseInt(minuteText, 10);

    let newTime = moment.isMoment(value) && value.clone();

    if (isNaN(hours) || isNaN(minutes)) {
      newTime = '';
    } else {
      if (!moment.isMoment(newTime)) {
        newTime = moment();
      }
      newTime.hour(clamp(hours, 0, 23));
      newTime.minute(clamp(minutes, 0, 59));
      newTime.second(0);
      newTime.millisecond(0);
    }

    this.setState({
      hourText,
      minuteText
    });

    if (!('value' in this.props)) {
      this.setState({
        value: newTime
      });
    }

    const validMoment = moment.isMoment(newTime);

    if (newTime !== value) {
      onChange(
        validMoment ? formatMoment(newTime, valueFormat) : newTime,
        validMoment && newTime.toDate()
      );
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

    const {hourText, minuteText} = this.state;

    delete otherProps.valueFormat;
    delete otherProps.displayFormat;
    delete otherProps.value;
    delete otherProps.defaultValue;

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
          value={ hourText }
          placeholder="HH"
          min="0"
          max="23"
          invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          required={ required }
          quiet={ quiet }
          onChange={ this.handleHourChange }
          onBlur={ this.handleHourBlur }
        />
        <span className="coral-Clock-divider">:</span>
        <Textfield
          ref="minute"
          className="coral-Clock-minute"
          type="number"
          value={ minuteText }
          placeholder="mm"
          min="0"
          max="59"
          invalid={ invalid }
          disabled={ disabled }
          readOnly={ readOnly }
          required={ required }
          quiet={ quiet }
          onChange={ this.handleMinuteChange }
          onBlur={ this.handleMinuteBlur }
        />
      </div>
    );
  }
}
