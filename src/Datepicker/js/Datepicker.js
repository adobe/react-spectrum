import autobind from 'autobind-decorator';
import Button from '../../Button';
import Calendar from '../../Calendar';
import CalendarIcon from '../../Icon/Calendar';
import classNames from 'classnames';
import Clock from '../../Clock';
import ClockIcon from '../../Icon/Clock';
import CloseIcon from '../../Icon/Close';
import createId from '../../utils/createId';
import {DateRange} from 'moment-range';
import FieldLabel from '../../FieldLabel';
import {FOCUS_RING_CLASSNAME} from '../../utils/focusRing';
import InputGroup from '../../InputGroup';
import intlMessages from '../intl/*.json';
import isEmpty from 'lodash/isEmpty';
import {messageFormatter} from '../../utils/intl';
import moment from 'moment';
import OverlayTrigger from '../../OverlayTrigger';
import Popover from '../../Popover';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Textfield from '../../Textfield';
import {toMoment} from '../../utils/moment';
import '../style/index.styl';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${DEFAULT_DATE_VAL_FORMAT} ${DEFAULT_TIME_VAL_FORMAT}`;
const SELECTION_TYPES = {
  single: 'single',
  range: 'range'
};

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Datepicker extends Component {
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
      PropTypes.number,
      PropTypes.array
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
    onChange: PropTypes.func,
    placement: PropTypes.string,
    selectionType: PropTypes.oneOf([SELECTION_TYPES.single, SELECTION_TYPES.range])
  };

  static defaultProps = {
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
    placeholder: 'yyyy-mm-dd',
    onChange: function () {},
    placement: 'right',
    selectionType: SELECTION_TYPES.single
  };

  constructor(props) {
    super(props);

    this.datepickerId = createId();

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
      open: false,
      focused: false,
      invalid: false
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

  get isRange() {
    return this.props.selectionType === SELECTION_TYPES.range;
  }

  getDefaultValueFormat(props) {
    const {type} = props;

    switch (type) {
      case 'time': return DEFAULT_TIME_VAL_FORMAT;
      case 'datetime': return DEFAULT_DATE_TIME_VAL_FORMAT;
      case 'date': return DEFAULT_DATE_VAL_FORMAT;
      default:
        throw new Error(`${type} is not a valid type. Must be 'date', 'datetime', or 'time'`);
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
    if (
      this.isRange
      && !isEmpty(momentDate)
      && momentDate.start.isValid()
      && momentDate.end.isValid()
    ) {
      let startOrEnd = ['start', 'end'];
      // fix incorrect range order for start and end times on same date
      if (momentDate.end.isBefore(momentDate.start)) {
        startOrEnd = startOrEnd.reverse();
      }
      return {
        start: momentDate[startOrEnd[0]].format(displayFormat),
        end: momentDate[startOrEnd[1]].format(displayFormat)
      };
    } else if (
      !this.isRange
      && momentDate
      && momentDate.isValid()
    ) {
      return momentDate.format(displayFormat);
    }
    return this.isRange ? {start: '', end: ''} : '';
  }

  updateDateWithClockTime(date) {
    const {
      type,
      selectionType
    } = this.props;

    let newDate = date.clone();
    if (type === 'datetime' && this.clockRef) {
      let startTime = this.clockRef.state.value;
      let startTimeIsValid = startTime && startTime.isValid();
      if (selectionType === SELECTION_TYPES.range) {
        if (startTimeIsValid) {
          newDate.start.hours(startTime.hours());
          newDate.start.minutes(startTime.minutes());
          newDate.start.seconds(startTime.seconds());
        }
        let endTime = this.endClockRef.state.value;
        if (endTime && endTime.isValid()) {
          newDate.end.hours(endTime.hours());
          newDate.end.minutes(endTime.minutes());
          newDate.end.seconds(endTime.seconds());
        }
      } else if (startTimeIsValid) {
        newDate.hours(startTime.hours());
        newDate.minutes(startTime.minutes());
        newDate.seconds(startTime.seconds());
      }
    }

    return newDate;
  }

  handleCalendarChange(date) {
    date = this.updateDateWithClockTime(date);
    this.setValue(this.formatValueToInputText(date), date);
    this.setState({
      invalid: false
    });

    if (this.overlayTriggerRef && this.props.type === 'date') {
      this.overlayTriggerRef.hide();
    } else {
      this.setState({open: false});
    }
  }

  handleClockChange(name, valueText, valueDate) {
    let {
      value,
      valueFormat
    } = this.state;

    const date = toMoment(valueDate, valueFormat);
    if (date && date.isValid()) {
      if (this.isRange) {
        let newValue = value && value.clone();
        if (!newValue && this.props.type === 'time') {
          newValue = new DateRange(date, date);
        }
        if (newValue && (!value || !newValue[name].isSame(date))) {
          newValue[name] = date;
          this.setValue(this.formatValueToInputText(newValue), newValue);
        }
      } else {
        this.setValue(this.formatValueToInputText(date), date);
      }
    }
  }

  handleTextChange(value, e) {
    e.stopPropagation();
    // Don't call this.props.onChange. We'll notify that a change happened when the text field is
    // blurred instead. This is done to avoid casting the text into a date object and then have it
    // fed back into the Datepicker. In some cases, if the user is between editing and the change
    // determines an invalid date was typed, the text may suddenly be changed out from under the
    // user, making it very difficult to change the text in the date. Instead just update the
    // internal state of the textfield. This means we don't get a truly controlled textfield, but
    // given the date conversion problems, we don't have any other viable option.
    let valueText = this.isRange
      ? {...this.state.valueText, [e.target.name]: value} :
      value;
    this.setState({valueText});
  }

  focus() {
    if (this.textfieldRef && !this.props.disabled) {
      this.textfieldRef.focus();
    }
  }

  onFocus(e) {
    this.setState({focused: true});
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  handleTextBlur(e) {
    const {displayFormat} = this.state;
    const text = this.isRange
      ? {...this.state.valueText, [e.target.name]: e.target.value}
      : e.target.value;
    let date = null;
    let invalid = false;

    if (this.isRange && text.start && text.end) {
      const start = moment(text.start, displayFormat, true);
      const end = moment(text.end, displayFormat, true);

      date = new DateRange(start, end);
      invalid = this.handleValidation(date.start, displayFormat) || this.handleValidation(date.end, displayFormat) || date.start > date.end;
    } else if (!this.isRange && text) {
      date = moment(text, displayFormat, true);
      invalid = this.handleValidation(date, displayFormat);
    }

    date = invalid ? null : date;

    this.setValue(text, date);
    this.setState({
      focused: false,
      invalid
    }, () => {
      if (!this.textfieldRef) {
        return;
      }

      // clean up focus-ring
      const dom = ReactDOM.findDOMNode(this);
      if (dom) {
        const node = dom.querySelector(`.${FOCUS_RING_CLASSNAME}`);
        if (node) {
          node.classList.remove(FOCUS_RING_CLASSNAME);
        }
      }
    });

    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  handleValidation(date, displayFormat) {
    return !date || !date.isValid() || date._f !== displayFormat;
  }

  handleKeyDown(e) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);

      // If defaultPrevented, don't open the Popover.
      if (e.defaultPrevented) {
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        this.overlayTriggerRef.show(e);
        break;
    }
  }

  handleHidePopover() {
    this.setState({open: false});
  }

  handleShowPopover() {
    this.setState({open: true});
  }

  handlePopoverKeyDown(e) {
    if (e.key === 'Enter' &&
        (e.target.tagName === 'INPUT' ||
         (this.calendarRef &&
          e.target === this.calendarRef.calendarBody &&
         !this.isRange))) {
      e.stopPropagation();

      this.overlayTriggerRef.hide();
    }
  }

  handleClickCloseButton(e) {
    e.preventDefault();
    e.stopPropagation();
    this.overlayTriggerRef.hide(e);
  }

  /**
   * Generates a unique id for a DOM element descendant
   * * @param   {Sting} string String value
   * @returns {String} A unique id
   */
  generateId(string) {
    const {id = this.datepickerId} = this.props;

    return `${id}-${string}`;
  }

  setCalendarRef(c) {
    this.calendarRef = c;
  }

  setClockRef(c) {
    this.clockRef = c;
  }

  setEndClockRef(c) {
    this.endClockRef = c;
  }

  setTextfieldRef(t) {
    this.textfieldRef = t;
  }

  setEndTextfieldRef(t) {
    this.endTextfieldRef = t;
  }

  setOverlayTriggerRef(t) {
    this.overlayTriggerRef = t;
  }

  setPopoverRef(p) {
    this.popoverRef = p;
  }

  renderTextfield(props, name) {
    let {
      id,
      valueText,
      invalid,
      open,
      ariaLabel,
      ariaLabelledby,
      comboboxId,
      popoverId,
      readOnly,
      disabled,
      ...otherProps
    } = props;

    if (name) {
      if (name === 'end') {
        id = `${id}-end`;
        ariaLabel = formatMessage('End Date');
      } else {
        ariaLabel = formatMessage('Start Date');
      }
      if (ariaLabelledby) {
        ariaLabelledby = `${ariaLabelledby} ${id}`;
      } else if (props.ariaLabel) {
        ariaLabelledby = `${comboboxId} ${id}`;
      }
    }

    return (
      <Textfield
        className={classNames(
          'spectrum-InputGroup-field',
          name && `spectrum-Datepicker-${name}Field`
        )}
        aria-invalid={invalid}
        invalid={name !== 'start' ? invalid || this.state.invalid : null}
        value={name ? valueText[name] : valueText}
        name={name}
        ref={name === 'end' ? this.setEndTextfieldRef : this.setTextfieldRef}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-controls={open ? popoverId : null}
        disabled={disabled}
        readOnly={readOnly}
        {...otherProps}
        onChange={!readOnly && !disabled ? this.handleTextChange : null}
        onFocus={!readOnly && !disabled ? this.onFocus : null}
        onBlur={!readOnly && !disabled ? this.handleTextBlur : null}
        onKeyDown={!readOnly && !disabled ? this.handleKeyDown : null} />
    );
  }

  renderCalendar(props) {
    return (
      <Calendar
        className={classNames(
          'spectrum-Calendar--padded',
          this.props.type === 'datetime' && 'react-spectrum-Datepicker-Calendar--datetime'
        )}
        {...props}
        ref={this.setCalendarRef}
        autoFocus
        onChange={this.handleCalendarChange} />
    );
  }

  renderClock(props, name) {
    let {
      id,
      value,
      ...otherProps
    } = props;

    let startOrEnd;
    let fieldLabel;
    let labelId;

    if (name) {
      id = `${id}-${name}`;
      fieldLabel = name === 'endTime' ? formatMessage('End Time') : formatMessage('Start Time');
      labelId = `${id}-label`;
      startOrEnd = name.substring(0, name.length - 4);
      if (value) {
        value = value[startOrEnd];
      }
      delete otherProps['aria-label'];
    }

    return (
      <div className="react-spectrum-Datepicker-clockContainer">
        {name &&
          <FieldLabel
            id={labelId}
            labelFor={id}
            label={fieldLabel} />
        }
        <Clock
          {...otherProps}
          value={value}
          name={name}
          id={id}
          aria-labelledby={labelId}
          ref={name === 'endTime' ? this.setEndClockRef : this.setClockRef}
          autoFocus={this.props.type === 'time' && name !== 'endTime'}
          onChange={this.handleClockChange.bind(this, startOrEnd)} />
      </div>
    );
  }

  render() {
    const {
      id = this.datepickerId,
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
      placement,
      selectionType,
      ...otherProps
    } = this.props;

    const {
      valueText,
      value,
      valueFormat,
      displayFormat,
      focused,
      open
    } = this.state;

    const ariaLabel = otherProps['aria-label'];
    const ariaLabelledby = otherProps['aria-labelledby'];

    delete otherProps['aria-label'];
    delete otherProps['aria-labelledby'];

    // We are using state for these.
    delete otherProps.value;
    delete otherProps.defaultValue;

    const comboboxId = this.generateId('combobox');
    const popoverId = this.generateId('popover');
    const buttonId = this.generateId('button');

    const textfieldProps = {
      id,
      valueText,
      invalid,
      placeholder,
      quiet,
      readOnly,
      required,
      disabled,
      open,
      ariaLabel,
      ariaLabelledby,
      comboboxId,
      popoverId,
      ...otherProps
    };

    const calendarProps = {
      id: this.generateId('calendar'),
      'aria-label': formatMessage('Calendar'),
      headerFormat,
      max,
      min,
      startDay,
      disabled,
      invalid,
      readOnly,
      required,
      value,
      valueFormat,
      selectionType,
      style: {'width': '280px'}
    };

    const clockProps = {
      id: this.generateId('clock'),
      'aria-label': formatMessage('Time'),
      value,
      valueFormat,
      displayFormat,
      disabled,
      invalid,
      readOnly,
      required
    };

    const triggerAriaLabel = type === 'time' ? formatMessage('Time') : formatMessage('Calendar');

    return (
      <InputGroup
        quiet={quiet}
        disabled={disabled}
        invalid={invalid || this.state.invalid}
        focused={focused}
        id={comboboxId}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-owns={open ? popoverId : null}
        aria-label={this.isRange ? ariaLabel : null}
        aria-labelledby={this.isRange ? ariaLabelledby : null}
        className={classNames(
          'spectrum-Datepicker',
          'react-spectrum-Datepicker',
          this.isRange && 'spectrum-Datepicker--range',
          this.isRange && type === 'datetime' && 'spectrum-Datepicker--datetimeRange',
          className
        )}>
        {!this.isRange && this.renderTextfield(textfieldProps)}
        {this.isRange &&
          [
            this.renderTextfield(textfieldProps, 'start'),
            <div className="spectrum-Datepicker--rangeDash" />,
            this.renderTextfield(textfieldProps, 'end')
          ].map((el, i) => React.cloneElement(el, {key: i}))
        }
        <OverlayTrigger
          trigger="click"
          ref={this.setOverlayTriggerRef}
          target={this}
          placement={placement}
          onHide={this.handleHidePopover}
          onShow={this.handleShowPopover}
          delayHide={0}>
          <Button
            id={buttonId}
            variant="field"
            quiet={quiet}
            type="button"
            icon={type === 'time' ? <ClockIcon /> : <CalendarIcon />}
            invalid={invalid}
            disabled={readOnly || disabled}
            aria-label={triggerAriaLabel}
            aria-labelledby={ariaLabelledby ? `${ariaLabelledby} ${buttonId}` : null}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : null}
            onKeyDown={this.handleKeyDown}
            tabIndex={-1} />
          <Popover
            isDialog={false}
            open
            ref={this.setPopoverRef}
            id={popoverId}
            role="dialog"
            trapFocus
            aria-label={triggerAriaLabel}
            onKeyDown={this.handlePopoverKeyDown}>
            <div>
              {type !== 'time' && this.renderCalendar(calendarProps)}
              {type !== 'date' &&
                (
                  this.isRange 
                  ? [
                    this.renderClock(clockProps, 'startTime'),
                    this.renderClock(clockProps, 'endTime')
                  ].map((el, i) => React.cloneElement(el, {key: i}))
                  : this.renderClock(clockProps)
                )
              }
              <Button
                className="react-spectrum-Datepicker-closeButton"
                label={null}
                icon={<CloseIcon alt={formatMessage('Close')} size="XS" />}
                quiet
                variant="action"
                tabIndex={-1}
                onClick={this.handleClickCloseButton} />
            </div>
          </Popover>
        </OverlayTrigger>
        {this.isRange && focused && <div className="spectrum-Datepicker-focusRing" role="presentation" />}
      </InputGroup>
    );
  }
}
