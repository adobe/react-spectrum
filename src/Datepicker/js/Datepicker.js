import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from '../../Button';
import InputGroup from '../../InputGroup';
import Textfield from '../../Textfield';
import Calendar from '../../Calendar';
import Popover from '../../Popover';
import Clock from '../../Clock';
import createId from '../../utils/createId';
import {toMoment} from '../../utils/moment';

import '../style/index.styl';

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
    valueFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    displayFormat: PropTypes.string,
    startDay: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    placeholder: PropTypes.string,
    quiet: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    invalid: PropTypes.bool,
    // Customize how to constrain the popover so it pins to the edge of the window,
    // scroll container, etc, or if it flips when it would otherwise be clipped.
    // This is passed to tether internally. See http://tether.io/#constraints
    attachmentConstraints: PropTypes.shape({
      to: PropTypes.string,
      attachment: PropTypes.string,
      pin: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ])
    }),
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
    attachmentConstraints: {
      to: 'window',
      attachment: 'together', // flip when we hit a boundary
      pin: true
    },
    onChange: function () {}
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
      valueText: this.formatValueToInputText(val, newDisplayFormat),
      valueFormat: newValueFormat,
      displayFormat: newDisplayFormat,
      open: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const valueFormatChanged = this.props.valueFormat !== nextProps.valueFormat;
    const displayFormatChanged = this.props.displayFormat !== nextProps.displayFormat;

    const valueFormat = valueFormatChanged ? nextProps.valueFormat : this.state.valueFormat;
    const displayFormat = displayFormatChanged ? nextProps.displayFormat : this.state.displayFormat;

    this.setState({
      valueFormat,
      displayFormat
    });

    if ('value' in nextProps) {
      const val = toMoment(nextProps.value, valueFormat);
      this.setState({
        value: val,
        valueText: this.formatValueToInputText(val, displayFormat)
      });
    }
  }

  getDefaultValueFormat(props) {
    const {type} = props;

    switch (type) {
      case 'time': return DEFAULT_TIME_VAL_FORMAT;
      case 'datetime': return DEFAULT_DATE_TIME_VAL_FORMAT;
      case 'date': return DEFAULT_DATE_VAL_FORMAT;
      default:
        throw new Error(`${ type } is not a valid type. Must be 'date', 'datetime', or 'time'`);
    }
  }

  setValue(valueText, value) {
    const {onChange} = this.props;

    if (!('value' in this.props)) {
      this.setState({
        valueText,
        value
      });
    }

    onChange(valueText, value);
  }

  formatValueToInputText(momentDate, displayFormat = this.state.displayFormat) {
    if (momentDate && momentDate.isValid()) {
      return momentDate.format(displayFormat);
    }
    return '';
  }

  handleCalendarButtonClick = () => {
    this.setState({open: !this.state.open});
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

  handleCalendarChange = (date) => {
    if (date.isValid()) {
      this.setValue(this.formatValueToInputText(date), date);
    }
    this.setState({open: false});
  }

  handleClockChange = (valueText, valueDate) => {
    const date = moment(valueDate);
    if (date.isValid()) {
      this.setValue(valueText, date);
    }
  }

  handleTextChange = e => {
    e.stopPropagation();
    // Don't call this.props.onChange. We'll notify that a change happened when the text field is
    // blurred instead. This is done to avoid casting the text into a date object and then have it
    // fed back into the Datepicker. In some cases, if the user is between editing and the change
    // determines an invalid date was typed, the text may suddenly be changed out from under the
    // user, making it very difficult to change the text in the date. Instead just update the
    // internal state of the textfield. This means we don't get a truly controlled textfield, but
    // given the date conversion problems, we don't have any other viable option.
    this.setState({
      valueText: e.target.value
    });
  }

  handleTextBlur = e => {
    const {displayFormat} = this.state;
    const text = e.target.value;
    let date = moment(text, displayFormat, true);
    // eslint-disable-next-line no-underscore-dangle
    if (!date || !date.isValid() || date._f !== displayFormat) {
      date = null;
    }
    this.setValue(text, date);

    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  closeCalendarPopover() {
    this.setState({open: false});
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
          displayFormat={ this.state.displayFormat }
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
      attachmentConstraints,
      quiet,
      disabled,
      invalid,
      readOnly,
      required,
      className,
      ...otherProps
    } = this.props;

    const {open, valueText, value, valueFormat} = this.state;

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
        attachmentConstraints={ attachmentConstraints }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-required={ required }
        aria-expanded={ open }
        aria-owns={ id }
        aria-haspopup
        onClose={ this.handlePopoverClose }
      >
        <InputGroup quiet={quiet}>
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
            onBlur={ this.handleTextBlur }
          />
          <div ref="button" className="coral-InputGroup-button">
            <Button
              className={ classNames({'coral-Button--quiet': quiet}) }
              type="button"
              icon={ type === 'time' ? 'clock' : 'calendar' }
              iconSize="S"
              square
              disabled={ readOnly || disabled }
              onClick={ this.handleCalendarButtonClick }
            />
          </div>
        </InputGroup>
      </Popover>
    );
  }
}
