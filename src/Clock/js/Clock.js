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
import {clamp} from '../../utils/number';
import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import {formatMoment, toMoment} from '../../utils/moment';
import {getLocale, messageFormatter} from '../../utils/intl';
import intlMessages from '../intl/*.json';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Select from '../../Select';
import Textfield from '../../Textfield';
import '../style/index.styl';
import VisuallyHidden from '../../VisuallyHidden';

const formatMessage = messageFormatter(intlMessages);


/* In Firefox, input[type=number] always strips leading 0. */
let useTextInputType = typeof document !== 'undefined' ? 'MozAppearance' in document.documentElement.style : null;

@convertUnsafeMethod
@autobind
export default class Clock extends Component {
  static displayName = 'Clock';

  static propTypes = {
    /**
     * Puts component into a controlled state. Clock can accept a number of different value representations
     */
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),

    /**
     * Value component is initally set to. Clock can accept a number of different value representations
     */
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),

    /**
     * Moment formats
     */
    valueFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /**
     * Moment formats
     */
    displayFormat: PropTypes.string,

    /**
     * Removes borders around inputs
     */
    quiet: PropTypes.bool,

    /**
     * Greys out the control and makes it so you can't interact with it
     */
    disabled: PropTypes.bool,

    /**
     * Marks the input red as invalid input
     */
    invalid: PropTypes.bool,

    /**
     * Makes it so the value can't be changed by the user
     */
    readOnly: PropTypes.bool,

    /**
     * Mark a form input as required, also necessary for the form to be submitted
     */
    required: PropTypes.bool,

    /**
     * Boolean indicating this component gets focus when mounted to DOM
     */
    autoFocus: PropTypes.bool,

    /**
     * Called when the value changes, returns a Moment object
     */
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

    this._useTextInputType = useTextInputType;

    this.clockId = createId();

    const {value, defaultValue, displayFormat, valueFormat} = this.props;

    moment.locale(getLocale());
    const val = toMoment(value || defaultValue || '', valueFormat);
    const isValid = val && val.isValid();
    const displayMeridiem = /a/i.test(displayFormat);

    this.state = {
      value: val,
      hourText: isValid ? this.getDisplayHour(val.hour(), displayMeridiem) : '',
      minuteText: isValid ? val.format('mm') : '',
      meridiemVal: this.getMeridiemVal(val),
      displayMeridiem: displayMeridiem
    };
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.autoFocusTimeout = requestAnimationFrame(() => this.focus());
    }
  }

  componentWillUnmount() {
    if (this.autoFocusTimeout) {
      cancelAnimationFrame(this.autoFocusTimeout);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setValue(nextProps.value, nextProps.valueFormat || this.props.valueFormat);
    }
  }

  setValue(value, valueFormat, callback = () => {}) {
    const val = toMoment(value, valueFormat || this.props.valueFormat);
    const isValid = val && val.isValid();
    const {
      hourText,
      minuteText,
      displayMeridiem,
      meridiemVal
    } = this.state;

    const newState = {
      value: val
    };

    if (!isValid) {
      newState.hourText = hourText || '';
      newState.minuteText = minuteText || '';
      newState.meridiemVal = meridiemVal || '';
    } else {
      let hourTextVal = this.getDisplayHour(val.hour(), displayMeridiem);
      const newMeridiemVal = this.getMeridiemVal(val);
      if (!hourText || +hourText !== hourTextVal) {
        newState.hourText = hourTextVal.padStart(2, '0');
      }

      if (!minuteText || +minuteText !== val.minute()) {
        newState.minuteText = val.format('mm').padStart(2, '0');
      }

      if (!meridiemVal || meridiemVal !== newMeridiemVal) {
        newState.meridiemVal = newMeridiemVal;
      }
    }

    this.setState(newState, callback);
  }

  /**
   * Handles change event on hour text input
   * @param {Event} e Change event
   * @private
   */
  handleHourChange(value, e) {
    const {minuteText, meridiemVal} = this.state;
    e.stopPropagation();
    let newValue = value;
    if (value.replace) {
      newValue = value.replace(/\D/g, '');
    }
    this.changeTime(newValue, minuteText, meridiemVal);
  }

  /**
   * Handles change event on minute text input
   * @param {Event} e Change event
   * @private
   */
  handleMinuteChange(value, e) {
    const {hourText, meridiemVal} = this.state;
    e.stopPropagation();
    let newValue = value;
    if (value.replace) {
      newValue = value.replace(/\D/g, '');
    }
    this.changeTime(hourText, newValue, meridiemVal);
  }

  /**
   * Handles AM/PM Change
   * @param {string} value either 'am' or 'pm'
   * @private
   */
  handleMeridiemChange(value) {
    const {hourText, minuteText} = this.state;
    this.changeTime(hourText, minuteText, value);
  }

  /**
   * Handles focus event on text input
   * @param {FocusEvent} e Focus event
   * @private
   */
  handleFocus(e) {
    this.setState({
      focused: true
    });
  }

  /**
   * Handles blur event on hour text input
   * @param {FocusEvent} e Blur event
   * @private
   */
  handleHourBlur(e) {
    let value = e.target.value;

    this.setState({
      hourText: value.padStart(2, '0'),
      focused: false
    });
  }

  /**
   * Handles blur event on minute text input
   * @param {FocusEvent} e Blur event
   * @private
   */
  handleMinuteBlur(e) {
    let value = e.target.value;

    this.setState({
      minuteText: value.padStart(2, '0'),
      focused: false
    });
  }

  /**
   * Handles up or down arrow key event on text input, and depending
   * on value and direction loops time value and adjusts meridiem.
   * @param {Boolean} isHours Whether event target is the hours input
   * @param {KeyboardEvent} e Keyboard event
   * @private
   */
  handleTextfieldKeyDown(isHours = false, e) {
    let value = this.state.value;
    let newTime = value || toMoment('00:00', this.props.valueFormat);
    let {
      onChange,
      valueFormat
    } = this.props;

    switch (e.key) {
      case 'ArrowUp':
      case 'Up':
        newTime = moment(newTime).add(1, isHours ? 'hour' : 'minute');
        break;
      case 'ArrowDown':
      case 'Down':
        newTime = moment(newTime).add(-1, isHours ? 'hour' : 'minute');
        break;
      default:
        return;
    }

    if (newTime !== value && moment.isMoment(newTime)) {
      // don't keep the YYYY-MM-DD the same after adding/subtracting hours or minutes
      if (moment.isMoment(value)) {
        newTime = newTime.year(value.year()).month(value.month()).date(value.date());
      }
      e.preventDefault();
      this.setValue(newTime, valueFormat, () => {
        onChange(
          formatMoment(newTime, valueFormat),
          newTime.toDate()
        );
      });
    }
  }

  /**
   * Updates time based on hour and minute text values.
   * @param {String} hourText   Hour text value
   * @param {String} minuteText Minute text value
   * @param {String} meridiemVal    'am' or 'pm'
   * @private
   */
  changeTime(hourText, minuteText, meridiemVal) {
    const {valueFormat, onChange} = this.props;
    const {value, displayMeridiem} = this.state;
    const meridiemOffset = displayMeridiem && meridiemVal === 'pm' ? 12 : 0;
    let hours = parseInt(hourText, 10);
    if (hours < 12) {
      hours += meridiemOffset;
    } else if (meridiemOffset === 0 && hours === 12) {
      hours = 0;
    }
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
      minuteText,
      meridiemVal,
      newTime
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

  /**
   * Sets focus to appropriate descendant.
   * @private
   */
  focus() {
    if (document.activeElement !== this.minuteRef) {
      this.hourRef && this.hourRef.focus();
    }
  }

  /**
   * Returns concatentated string of the ids for elements that label the clock field inputs.
   * @param {String} labelId Field label id
   * @param {String} groupId Fieldset id
   * @return {String}   aria-labelledby string
   * @private
   */
  getAriaLabelledbyForTextfield(labelId, groupId) {
    const ariaLabel = this.props['aria-label'];
    const ariaLabelledby = this.props['aria-labelledby'];
    let ariaLabelledbyId = groupId;
    if (ariaLabel) {
      ariaLabelledbyId = groupId;
    }
    if (ariaLabelledby) {
      ariaLabelledbyId = ariaLabelledby;
    }
    return [ariaLabelledbyId, labelId].join(' ');
  }

  /**
   * Returns display hour for a given 24-hour value
   * @param {Number} hour Hour in range 0-23
   * @param {Boolean} displayMeridiem Output should be converted to 12-hour clock
   * @return {String} in range 1-12 (12-hour) or 0-23 (24-hour)
   * @private
   */
  getDisplayHour(hour, displayMeridiem) {
    const newHour = displayMeridiem ? (hour + 11) % 12 + 1 : hour;
    return newHour.toString().padStart(2, '0');
  }

  /**
   * Returns localized label for AM/PM dropdown
   * @param {String} meridiem 'am' or 'pm'
   * @param {String} displayFormat from props
   * @return {String} in range 1-12 (12-hour) or 0-23 (24-hour)
   * @private
   */
  getMeridiemLabel(meridiem, displayFormat) {
    const localizedMeridiem = formatMessage(meridiem);
    const upperCase = /A/.test(displayFormat);
    return upperCase ? localizedMeridiem.toUpperCase() : localizedMeridiem;
  }

  /**
   * Returns AM/PM (meridiem) value for a given moment
   * @param {Object} moment
   * @return {String} 'am', 'pm', or '' (for invalid moment values)
   * @private
   */
  getMeridiemVal(moment) {
    if (!moment || !moment.isValid()) {
      return '';
    } else {
      return moment.hour() >= 12 ? 'pm' : 'am';
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
      id = this.clockId,
      displayFormat,
      ...otherProps
    } = this.props;

    const {hourText, minuteText, meridiemVal, newTime, value, focused, displayMeridiem} = this.state;
    const hourMax = displayMeridiem ? 12 : 23;
    const hourMin = displayMeridiem ? 1 : 0;
    const groupId = id + '-group';
    const timeLabelId = id + '-time-label';
    const ariaLabel = otherProps['aria-label'];
    const ariaLabelledby = otherProps['aria-labelledby'];
    let groupAriaLabel = null;
    let groupAriaLabelledby = null;
    let formattedMoment = formatMoment(newTime || value, displayFormat);

    if (ariaLabel) {
      groupAriaLabel = ariaLabel;
      groupAriaLabelledby = [groupId, timeLabelId].join(' ');
      delete otherProps['aria-label'];
    } else {
      groupAriaLabelledby = timeLabelId;
    }

    if (ariaLabelledby) {
      groupAriaLabelledby = [ariaLabelledby, timeLabelId].join(' ');
      delete otherProps['aria-labelledby'];
    }

    delete otherProps.autoFocus;
    delete otherProps.valueFormat;
    delete otherProps.value;
    delete otherProps.defaultValue;

    const useTextInputType = this._useTextInputType;
    const inputType = useTextInputType ? 'text' : 'number';
    const inputRole = useTextInputType ? 'spinbutton' : null;

    // cant use input text with pattern to handle our validation
    // IE 11 requires that no two options in an alternation be able to start with the
    // same character (for the regex in a pattern attribute). If multiple options can
    // start with the same character (or blank), all but the first will be ignored
    // for that case.
    //
    // cant use input number by itself because IE 11 won't prevent other characters
    return (
      <div
        className={
          classNames(
            'react-spectrum-Clock',
            className
          )
        }
        aria-disabled={disabled}
        aria-invalid={invalid}
        role="group"
        id={groupId}
        aria-label={groupAriaLabel}
        aria-labelledby={groupAriaLabelledby}
        {...filterDOMProps(otherProps)}>
        <VisuallyHidden element="time" id={timeLabelId} aria-live={focused ? 'polite' : 'off'} hidden={!focused}>{formattedMoment}</VisuallyHidden>
        <Textfield
          ref={el => this.hourRef = el}
          className="react-spectrum-Clock-hour"
          type={inputType}
          role={inputRole}
          inputMode="numeric"
          pattern={displayMeridiem ? '1[0-2]|0?[1-9]' : '2[0-3]|[01]?[0-9]'}
          value={hourText}
          placeholder={displayMeridiem ? 'hh' : 'HH'}
          min={!useTextInputType ? hourMin : null}
          max={!useTextInputType ? hourMax : null}
          aria-valuemin={hourMin}
          aria-valuemax={hourMax}
          aria-valuenow={hourText || null}
          aria-valuetext={hourText ? hourText.padStart(2, '0') : null}
          invalid={invalid}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          quiet={quiet}
          id={id}
          aria-label={formatMessage('Hours')}
          aria-labelledby={this.getAriaLabelledbyForTextfield(id, groupId)}
          onKeyDown={this.handleTextfieldKeyDown.bind(this, true)}
          onFocus={this.handleFocus}
          onChange={this.handleHourChange}
          onBlur={this.handleHourBlur} />
        <span className="react-spectrum-Clock-divider">:</span>

        <Textfield
          ref={el => this.minuteRef = el}
          className="react-spectrum-Clock-minute"
          type={inputType}
          role={inputRole}
          inputMode="numeric"
          pattern="[0-5]?[0-9]"
          value={minuteText}
          placeholder="mm"
          min={!useTextInputType ? 0 : null}
          max={!useTextInputType ? 59 : null}
          aria-valuemin={0}
          aria-valuemax={59}
          aria-valuenow={minuteText || null}
          aria-valuetext={minuteText ? minuteText.padStart(2, '0') : null}
          invalid={invalid}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          quiet={quiet}
          id={id + '-minutes'}
          aria-label={formatMessage('Minutes')}
          aria-labelledby={this.getAriaLabelledbyForTextfield(id + '-minutes', groupId)}
          onKeyDown={this.handleTextfieldKeyDown.bind(this, false)}
          onFocus={this.handleFocus}
          onChange={this.handleMinuteChange}
          onBlur={this.handleMinuteBlur} />
        {displayMeridiem &&
          <Select
            className="react-spectrum-Clock-meridiem"
            id={id + '-meridiem'}
            placeholder={formatMessage('AM/PM')}
            aria-label={formatMessage('AM/PM')}
            aria-labelledby={this.getAriaLabelledbyForTextfield(id + '-meridiem', groupId)}
            onChange={this.handleMeridiemChange}
            options={[
              {label: this.getMeridiemLabel('am', displayFormat), value: 'am'},
              {label: this.getMeridiemLabel('pm', displayFormat), value: 'pm'}
            ]}
            value={meridiemVal}
            alignRight
            flexible />
        }
      </div>
    );
  }
}
