import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from './Button';
import Textfield from './Textfield';
import Calendar from './Calendar';
import Popover from './Popover';
import Clock from './Clock';
import createId from './utils/createId';
import { toMoment } from './utils/moment';

import './Datepicker.styl';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${ DEFAULT_DATE_VAL_FORMAT } ${ DEFAULT_TIME_VAL_FORMAT }`;

export default class Datepicker extends Component {
  static displayName = 'Datepicker';

  static propTypes = {
    id: PropTypes.string,
    type: PropTypes.oneOf(['date', 'datetime', 'time']),
    headerFormat: PropTypes.string,
    max: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    min: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    valueFormat: PropTypes.string,
    displayFormat: PropTypes.string,
    startDay: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    placeholder: PropTypes.string,
    quiet: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    invalid: PropTypes.bool,
    onChange: PropTypes.func
  };

  static defaultProps = {
    id: createId(),
    type: 'date', // date, datetime, time
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    startDay: 0,
    quiet: false,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    placeholder: 'Choose a date',
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    const {
      value,
      defaultValue,
      displayFormat,
      valueFormat
    } = props;

    const newValueFormat = valueFormat || this.getDefaultValueFormat(props);
    const newDisplayFormat = displayFormat || this.getDefaultValueFormat(props);

    const val = toMoment(value || defaultValue || '', newValueFormat);

    this.state = {
      value: val,
      valueText: val && val.isValid() ? val.format(newDisplayFormat) : val || '',
      valueFormat: newValueFormat,
      displayFormat: newDisplayFormat,
      open: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const val = toMoment(nextProps.value);
      this.setState({
        value: val,
        valueText: val && val.isValid() ? val.format(this.state.displayFormat) : val || ''
      });
    }

    if (this.props.valueFormat !== nextProps.valueFormat) {
      this.setState({ valueFormat: nextProps.valueFormat });
    }

    if (this.props.displayFormat !== nextProps.displayFormat) {
      this.setState({ displayFormat: nextProps.displayFormat });
    }
  }

  getDefaultValueFormat(props) {
    const { type } = props;

    switch (type) {
      case 'time': return DEFAULT_TIME_VAL_FORMAT;
      case 'datetime': return DEFAULT_DATE_TIME_VAL_FORMAT;
      case 'date': return DEFAULT_DATE_VAL_FORMAT;
      default:
        throw new Error(`${ type } is not a valid type. Must be 'date', 'datetime', or 'time'`);
    }
  }

  setValue(valueText, value) {
    const { onChange } = this.props;

    if (!('value' in this.props)) {
      this.setState({
        valueText,
        value: moment(value)
      });
    }

    onChange(valueText, value);
  }

  handleCalendarButtonClick = () => {
    this.setState({ open: !this.state.open });
  }

  handlePopoverClose = e => {
    // Don't close the popover if the dropdown button was clicked.
    if (this.refs.button && !this.refs.button.contains(e.target)) {
      this.closeCalendarPopover();
    }
  }

  handleCalendarKeyDown = e => {
    if (e.keyCode === 27) { // escape key
      this.closeCalendarPopover();
    }
  }

  handleCalendarChange = (valueText, valueDate) => {
    this.setValue(valueText, valueDate);
    this.setState({ open: false });
  }

  handleClockChange = (valueText, valueDate) => {
    this.setValue(valueText, valueDate);
  }

  handleTextChange = e => {
    const { valueFormat } = this.state;
    const text = e.target.value;
    this.setValue(text, moment(text, valueFormat));
  }

  closeCalendarPopover() {
    this.setState({ open: false });
  }

  renderCalendar(props) {
    return (
      <Calendar
        className="u-coral-borderless"
        { ...props }
        onChange={ this.handleCalendarChange }
        onKeyDown={ this.handleCalendarKeyDown }
      />
    );
  }

  renderClock(props) {
    return (
      <div className="coral-Datepicker-clockContainer">
        <Clock
          { ...props }
          onChange={ this.handleClockChange }
          onKeyDown={ this.handleCalendarKeyDown }
        />
      </div>
    );
  }

  render() {
    const {
      id,
      type,
      headerFormat,
      max,
      min,
      startDay,
      placeholder,
      quiet,
      disabled,
      invalid,
      readOnly,
      required,
      className,
      ...otherProps
    } = this.props;

    const { open, valueText, value, valueFormat } = this.state;

    const calendarProps = {
      id,
      headerFormat,
      max,
      min,
      startDay,
      disabled,
      invalid,
      readOnly,
      required,
      value,
      valueFormat
    };

    const clockProps = {
      value,
      valueFormat,
      disabled,
      invalid,
      readOnly,
      required
    };

    // We are using state for these.
    delete otherProps.value;
    delete otherProps.defaultValue;

    return (
      <Popover
        dropClassName="coral-DatepickerPopover-drop"
        className={
          classNames(
            'coral-Datepicker',
            {
              'is-invalid': invalid
            },
            className
          )
        }
        open={ open }
        placement="bottom right"
        content={
          <div>
            { type !== 'time' && this.renderCalendar(calendarProps) }
            { type !== 'date' && this.renderClock(clockProps) }
          </div>
        }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-required={ required }
        aria-expanded={ open }
        aria-owns={ id }
        aria-haspopup
        onClose={ this.handlePopoverClose }
      >
        <div
          className={
            classNames(
              'coral-InputGroup',
              {
                'coral-InputGroup--quiet': quiet
              }
            )
          }
        >
          <Textfield
            className="coral-InputGroup-input"
            aria-invalid={ invalid }
            placeholder={ placeholder }
            value={ valueText }
            quiet={ quiet }
            readOnly={ readOnly }
            disabled={ disabled }
            invalid={ invalid }
            { ...otherProps }
            onChange={ this.handleTextChange }
          />
          <div ref="button" className="coral-InputGroup-button">
            <Button
              className={ classNames({ 'coral-Button--quiet': quiet }) }
              type="button"
              icon={ type === 'time' ? 'clock' : 'calendar' }
              iconSize="S"
              square
              disabled={ readOnly || disabled }
              onClick={ this.handleCalendarButtonClick }
            />
          </div>
        </div>
      </Popover>
    );
  }
}
