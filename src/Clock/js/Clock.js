import autobind from 'autobind-decorator';
import {clamp} from '../../utils/number';
import classNames from 'classnames';
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
import '../../utils/style/index.styl';

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Clock extends Component {
  static displayName = 'Clock';

  static propTypes = {
    /**
     * Clock can accept a number of different value represenationas
     */
    value: PropTypes.oneOfType([
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
     * Called when a breadcrumb is clicked with an object containing the label of the clicked breadcrumb
     * @callback Clock~onChange
     * @param {Object} event - Moment object
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

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const val = toMoment(nextProps.value, nextProps.valueFormat);
      const isValid = val && val.isValid();

      if (!isValid) {
        this.setState({
          hourText: this.state.hourText || '',
          minuteText: this.state.minuteText || '',
          meridiemVal: this.state.meridiemVal || ''
        });
      } else {
        const hourTextVal = this.getDisplayHour(val.hour(), this.state.displayMeridiem);
        const meridiemVal = this.getMeridiemVal(val);
        if (!this.state.hourText || +this.state.hourText !== hourTextVal) {
          this.setState({hourText: hourTextVal});
        }

        if (!this.state.minuteText || +this.state.minuteText !== val.minute()) {
          this.setState({minuteText: val.minute()});
        }

        if (!this.state.meridiemVal || this.state.meridiemVal !== meridiemVal) {
          this.setState({meridiemVal: meridiemVal});
        }
      }

      this.setState({
        value: val
      });
    }
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
   * @param {Event} e Change event
   * @private
   */
  handleMeridiemChange(value, e) {
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
    // normalize the hourText displayed in the input
    if (value.length <= 1) {
      value = `0${value}`;
    }

    this.setState({
      hourText: value,
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
    // normalize the minuteText displayed in the input
    if (value.length <= 1) {
      value = `0${value}`;
    }

    this.setState({
      minuteText: value,
      focused: false
    });
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
    return newHour.toString();
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
    const hourMax = displayMeridiem ? '12' : '23';
    const hourMin = displayMeridiem ? '1' : '0';
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

    delete otherProps.valueFormat;
    delete otherProps.value;
    delete otherProps.defaultValue;

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
        <time id={timeLabelId} className="u-react-spectrum-screenReaderOnly" aria-live={focused ? 'polite' : 'off'} hidden={!focused}>{formattedMoment}</time>
        <Textfield
          ref={el => this.hourRef = el}
          className="react-spectrum-Clock-hour"
          type="number"
          value={hourText}
          placeholder="HH"
          min={hourMin}
          max={hourMax}
          invalid={invalid}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          quiet={quiet}
          id={id}
          aria-label={formatMessage('Hours')}
          aria-labelledby={this.getAriaLabelledbyForTextfield(id, groupId)}
          onFocus={this.handleFocus}
          onChange={this.handleHourChange}
          onBlur={this.handleHourBlur} />
        <span className="react-spectrum-Clock-divider">:</span>

        <Textfield
          ref={el => this.minuteRef = el}
          className="react-spectrum-Clock-minute"
          type="number"
          value={minuteText}
          placeholder="mm"
          min="0"
          max="59"
          invalid={invalid}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          quiet={quiet}
          id={id + '-minutes'}
          aria-label={formatMessage('Minutes')}
          aria-labelledby={this.getAriaLabelledbyForTextfield(id + '-minutes', groupId)}
          onFocus={this.handleFocus}
          onChange={this.handleMinuteChange}
          onBlur={this.handleMinuteBlur} />
        {displayMeridiem &&
          <Select
            className="react-spectrum-Clock-meridiem"
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
