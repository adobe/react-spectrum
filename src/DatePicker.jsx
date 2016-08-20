import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from './Button';
import Textfield from './Textfield';
import Calendar from './Calendar';
import Popover from './Popover';
import Clock from './Clock';
import createId from './utils/createId';

import './DatePicker.styl';

export default class DatePicker extends Component {
  static defaultProps = {
    id: createId(),
    type: 'date', // date, datetime, time
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    value: 'today',
    valueFormat: 'YYYY-MM-DD',
    startDay: 0,
    quiet: false,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    placeholder: 'Choose a date',
    onChange: () => {}
  };

  state = {
    open: false
  };

  handleCalendarButtonClick = () => {
    this.setState({ open: true });
  }

  handlePopoverClose = () => {
    this.closeCalendarPopover();
  }

  handleCalendarKeyDown = e => {
    if (e.keyCode === 13) { // escape key
      this.closeCalendarPopover();
    }
  }

  handleCalendarChange = (valueStr, valueDate) => {
    const { onChange } = this.props;
    onChange(valueStr, valueDate);
  }

  handleClockChange = (valueStr, valueDate) => {
    const { onChange } = this.props;
    onChange(valueStr, valueDate);
  }

  handleTextChange = e => {
    const { onChange } = this.props;
    const text = e.currentTarget.value;
    onChange(text, moment(text));
  }

  closeCalendarPopover() {
    this.setState({ open: false });
  }

  renderCalendar() {
    const {
      id,
      headerFormat,
      max,
      min,
      value,
      valueFormat,
      startDay,
      disabled,
      invalid,
      readOnly,
      required
    } = this.props;

    return (
      <Calendar
        className="u-coral-borderless"
        id={ id }
        headerFormat={ headerFormat }
        max={ max }
        min={ min }
        value={ value }
        valueFormat={ valueFormat }
        startDay={ startDay }
        disabled={ disabled }
        invalid={ invalid }
        readOnly={ readOnly }
        required={ required }
        onChange={ this.handleCalendarChange }
        onKeyDown={ this.handleCalendarKeyDown }
      />
    );
  }

  renderClock() {
    const {
      value,
      valueFormat,
      disabled,
      invalid,
      readOnly,
      required
    } = this.props;

    return (
      <div className="coral-Datepicker-clockContainer">
        <Clock
          value={ value }
          valueFormat={ valueFormat }
          disabled={ disabled }
          invalid={ invalid }
          readOnly={ readOnly }
          required={ required }
          onChange={ this.handleClockChange }
        />
      </div>
    );
  }

  render() {
    const {
      id,
      type,
      placeholder,
      quiet,
      disabled,
      invalid,
      readOnly,
      required,
      className,
      ...otherProps
    } = this.props;

    const { open } = this.state;

    return (
      <Popover
        dropClassName="coral-DatePickerPopover-drop"
        className={ classNames('coral-DatePicker', className) }
        open={ open }
        placement="bottom right"
        content={
          <div>
            { type !== 'time' && this.renderCalendar() }
            { type !== 'date' && this.renderClock() }
          </div>
        }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-required={ required }
        aria-expanded={ open }
        aria-owns={ id }
        aria-haspopup
        { ...otherProps }
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
            quiet={ quiet }
            onChange={ this.handleTextChange }
          />
          <div className="coral-InputGroup-button">
            <Button
              className={ classNames({ 'coral-Button--quiet': quiet }) }
              type="button"
              icon={ type === 'time' ? 'clock' : 'calendar' }
              iconSize="S"
              square
              quiet
              onClick={ this.handleCalendarButtonClick }
            />
          </div>
        </div>
      </Popover>
    );
  }
}
