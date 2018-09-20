import autobind from 'autobind-decorator';
import Button from '../../Button';
import {chain} from '../../utils/events';
import ChevronDownSmall from '../../Icon/core/ChevronDownSmall';
import ChevronUpSmall from '../../Icon/core/ChevronUpSmall';
import {clamp, handleDecimalOperation} from '../../utils/number';
import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import InputGroup from '../../InputGroup';
import intlMessages from '../intl/*.json';
import LiveRegionAnnouncer from '../../utils/LiveRegionAnnouncer';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Textfield from '../../Textfield';
import '../../utils/style/index.styl';

importSpectrumCSS('stepper');

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class NumberInput extends Component {
  static propTypes = {
    /**
     * The default value.
     */
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * The input value.
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * The minimal value.
     */
    min: PropTypes.number,

    /**
     * The maximum value.
     */
    max: PropTypes.number,

    /**
     * The placeholder.
     */
    placeholder: PropTypes.string,

    /**
     * Increment/decrement by step based on the current value. This differs from the w3 spec,
     * which will increment/decrement to the next multiple of the current step, regardless of current value.
     */
    step: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['any'])]),

    /**
     * Whether the input is disabled.
     */
    disabled: PropTypes.bool,

    /**
     * Whether the input is invalid. Will display a red border around the input.
     */
    invalid: PropTypes.bool,

    /**
     * Whether the input is read only.
     */
    readOnly: PropTypes.bool,

    /**
     * Should be a localized string, it's the tooltip and what a screenreader will announce for the decrement button.
     */
    decrementTitle: PropTypes.string,

    /**
     * Should be a localized string, it's the tooltip and what a screenreader will announce for the increment button.
     */
    incrementTitle: PropTypes.string,

    /**
     * The callback function when the input number is changed.
     */
    onChange: PropTypes.func
  };

  static defaultProps = {
    placeholder: formatMessage('Enter a number'),
    step: 1,
    disabled: false,
    invalid: false,
    readOnly: false,
    decrementTitle: formatMessage('Decrement'),
    incrementTitle: formatMessage('Increment'),
    onChange: function () {}
  };

  constructor(props) {
    super(props);

    const {
      id,
      value,
      defaultValue
    } = props;

    this.state = {
      focused: false,
      valueInvalid: false,
      inputId: id || createId(),
      value: value || defaultValue || ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value || '',
        valueInvalid: this.isInputValueInvalid(nextProps.value)
      });
    }

    if ('defaultValue' in nextProps) {
      this.setState({
        valueInvalid: this.isInputValueInvalid(nextProps.defaultValue)
      });
    }
  }

  onMouseDown(e) {
    e.preventDefault();

    // Don't shift focus to textfield when increment/decrement button is pressed on a mobile device.
    !this.flagTouchStart && this.textfield.focus();
  }

  /**
  * Keep track of when increment/decrement button is pressed on a mobile device.
  */
  onTouchStart() {
    this.flagTouchStart = true;
  }

  handleDecrementButtonClick(e) {
    e.preventDefault();

    this.decrementValue();
  }

  handleIncrementButtonClick(e) {
    e.preventDefault();

    this.incrementValue();
  }

  handleFocus() {
    this.setState({focused: true});
  }

  handleBlur() {
    this.flagTouchStart = false;
    this.setState({focused: false});
    LiveRegionAnnouncer.clearMessage();
  }

  handleInputKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up arrow
      case 33: // page up
        e.preventDefault();
        this.incrementValue();
        break;
      case 40: // down arrow
      case 34: // page down
        e.preventDefault();
        this.decrementValue();
        break;
      case 35: // end
        e.preventDefault();
        this.decrementToMinValue();
        break;
      case 36: // home
        e.preventDefault();
        this.incrementToMaxValue();
        break;
      default:
        // do nothing
    }
  }

  handleInputScrollWheel(e) {
    e.preventDefault();

    // If the input isn't supposed to receive input, do nothing.
    if (this.isInactive()) {
      return;
    }

    if (e.deltaY < 0) {
      this.incrementValue();
    } else {
      this.decrementValue();
    }
  }

  handleInputChange(value, e) {
    e.stopPropagation();

    const {onChange} = this.props;
    const valueAsNumber = value === '' ? null : +value;
    const numeric = !isNaN(valueAsNumber);

    // They may be starting to type a negative number, we don't want to broadcast this to
    // the onChange handler, but we do want to update the value state.
    const resemblesNumber = numeric || value === '-' || value === '';

    // Only dispatch a change event if it's an actual number
    if (numeric || value === '') {
      onChange(valueAsNumber);
    }

    if (resemblesNumber) {
      this.setState({
        value,
        valueInvalid: this.isInputValueInvalid(value)
      });
    }
  }

  /**
   * @private
   * Returns true if the Textfield cannot receive any input.
   */
  isInactive() {
    const {disabled, readOnly} = this.props;
    const {focused} = this.state;

    return disabled || readOnly || !focused;
  }

  /**
   * @private
   * Adds step number to the value number so long as it stays within min/max (if they are defined).
   * If value is undefined, sets it to the step.
   */
  incrementValue() {
    let {min, max, step} = this.props;
    const {value} = this.state;

    if (isNaN(step)) {
      step = 1;
    }

    let newValue = +value;
    if (isNaN(newValue)) {
      newValue = max != null ? Math.min(step, max) : step;
    } else {
      newValue = clamp(handleDecimalOperation('+', newValue, step), min, max);
    }

    this.triggerChange(newValue);
  }

  /**
   * @private
   * If max is defined, sets value to the max value.
   */
  incrementToMaxValue() {
    const {max} = this.props;

    // If the input isn't supposed to receive input, do nothing.
    if (this.isInactive()) {
      return;
    }

    if (max != null) {
      this.triggerChange(max);
    }
  }

  /**
   * @private
   * Subtracts step number from the value number so long as it stays within min/max (if they are
   * defined). If value is undefined, sets it to the step.
   */
  decrementValue() {
    let {min, max, step} = this.props;
    const {value} = this.state;

    if (isNaN(step)) {
      step = 1;
    }

    let newValue = +value;
    if (isNaN(newValue)) {
      newValue = min != null ? Math.max(-step, min) : -step;
    } else {
      newValue = clamp(handleDecimalOperation('-', newValue, step), min, max);
    }

    this.triggerChange(newValue);
  }

  /**
   * @private
   * If min is defined, sets value to the max value.
   */
  decrementToMinValue() {
    const {min} = this.props;

    // If the input isn't supposed to receive input, do nothing.
    if (this.isInactive()) {
      return;
    }

    if (min != null) {
      this.triggerChange(min);
    }
  }

  /**
   * @private
   * Updates state to the new value and notifies the onChange handler.
   */
  triggerChange(newValue) {
    const {onChange} = this.props;
    const {value} = this.state;

    // Only trigger change event and setState if the value changed
    if (value !== newValue) {

      // Announce new value using a live region
      LiveRegionAnnouncer.announceAssertive(newValue.toString());

      this.setState({
        value: newValue,
        valueInvalid: this.isInputValueInvalid(newValue)
      });
      onChange(newValue);
    }
  }

  /**
   * @private
   * If true, the input's value is currently invalid.
   */
  isInputValueInvalid(value) {
    const {max, min} = this.props;

    return value !== '' && isNaN(+value)
      || (max !== null && value > max || min !== null && value < min);
  }

  render() {
    const {
      defaultValue,
      placeholder = formatMessage('Enter a number'),
      min,
      max,
      step,
      decrementTitle = formatMessage('Decrement'),
      incrementTitle = formatMessage('Increment'),
      invalid,
      disabled,
      quiet,
      className,
      readOnly,
      ...otherProps
    } = this.props;

    const {
      focused,
      value,
      valueInvalid,
      inputId
    } = this.state;

    return (
      <InputGroup
        focused={focused}
        invalid={invalid}
        quiet={quiet}
        disabled={disabled}
        className={classNames('spectrum-Stepper', 'react-spectrum-Stepper', {'spectrum-Stepper--quiet': quiet}, className)}
        role="group"
        aria-label={otherProps['aria-label'] || null}
        aria-labelledby={otherProps['aria-labelledby'] || null}>
        <Textfield
          {...filterDOMProps(otherProps)}
          ref={t => this.textfield = t}
          className="spectrum-Stepper-input"
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          role="spinbutton"
          type="number"
          autoComplete="off"
          aria-label={otherProps['aria-label'] || null}
          aria-labelledby={otherProps['aria-labelledby'] || null}
          aria-valuenow={value || null}
          aria-valuetext={value || null}
          aria-valuemin={min}
          aria-valuemax={max}
          invalid={invalid || valueInvalid}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          quiet={quiet}
          onKeyDown={chain(otherProps.onKeyDown, this.handleInputKeyDown)}
          onWheel={chain(otherProps.onWheel, this.handleInputScrollWheel)}
          onFocus={chain(otherProps.onFocus, this.handleFocus)}
          onBlur={chain(otherProps.onBlur, this.handleBlur)}
          onChange={this.handleInputChange} />
        <span
          className="spectrum-Stepper-buttons"
          role="presentation"
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onTouchStart={this.onTouchStart}>
          <Button
            className="spectrum-Stepper-stepUp"
            type="button"
            tabIndex="-1"
            aria-controls={inputId}
            variant="action"
            quiet={quiet}
            title={incrementTitle}
            aria-label={incrementTitle}
            disabled={disabled || max != null && value >= max || readOnly}
            onClick={this.handleIncrementButtonClick}
            onMouseDown={e => e.preventDefault()}
            onMouseUp={e => e.preventDefault()}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}>
            <ChevronUpSmall size={null} className="spectrum-Stepper-stepUpIcon" />
          </Button>
          <Button
            className="spectrum-Stepper-stepDown"
            type="button"
            tabIndex="-1"
            aria-controls={inputId}
            variant="action"
            quiet={quiet}
            title={decrementTitle}
            aria-label={decrementTitle}
            disabled={disabled || min != null && value <= min || readOnly}
            onClick={this.handleDecrementButtonClick}
            onMouseDown={e => e.preventDefault()}
            onMouseUp={e => e.preventDefault()}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}>
            <ChevronDownSmall size={null} className="spectrum-Stepper-stepDownIcon" />
          </Button>
        </span>
      </InputGroup>
    );
  }
}
