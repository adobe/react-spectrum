import Button from '../../Button';
import classNames from 'classnames';
import createId from '../../utils/createId';
import InputGroup from '../../InputGroup';
import React, {Component, PropTypes} from 'react';
import Textfield from '../../Textfield';
import '../style/index.styl';

export default class NumberInput extends Component {
  static propTypes = {
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    min: PropTypes.number,
    max: PropTypes.number,
    placeholder: PropTypes.string,
    step: PropTypes.number,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
    readOnly: PropTypes.bool,
    decrementTitle: PropTypes.string,
    incrementTitle: PropTypes.string,
    onChange: PropTypes.func
  };

  static defaultProps = {
    placeholder: 'Enter a number',
    step: 1,
    disabled: false,
    invalid: false,
    readOnly: false,
    decrementTitle: 'Decrement',
    incrementTitle: 'Increment',
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

  handleDecrementButtonClick = e => {
    e.preventDefault();
    this.decrementValue();
  }

  handleIncrementButtonClick = e => {
    e.preventDefault();
    this.incrementValue();
  }

  handleInputFocus = () => {
    this.setState({focused: true});
  }

  handleInputBlur = () => {
    this.setState({focused: false});
  }

  handleInputKeyDown = e => {
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

  handleInputScrollWheel = e => {
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

  handleInputChange = (value, e) => {
    e.stopPropagation();

    const {onChange} = this.props;
    const valueAsNumber = +value;
    const numeric = !isNaN(valueAsNumber);

    // They may be starting to type a negative number, we don't want to broadcast this to
    // the onChange handler, but we do want to update the value state.
    const resemblesNumber = numeric || value === '-';

    // Only dispatch a change event if it's an actual number
    if (numeric) {
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
   * Returns true if the Textfield cannot receive any input.
   */
  isInactive() {
    const {disabled, readOnly} = this.props;
    const {focused} = this.state;

    return disabled || readOnly || !focused;
  }

  /**
   * Adds step number to the value number so long as it stays within min/max (if they are defined).
   * If value is undefined, sets it to the step.
   */
  incrementValue() {
    const {max, step} = this.props;
    const {value} = this.state;

    let newValue = +value;
    if (isNaN(newValue)) {
      newValue = max != null ? Math.min(step, max) : step;
    } else {
      newValue = max != null ? Math.min(newValue + step, max) : newValue + step;
    }

    this.triggerChange(newValue);
  }

  /**
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
   * Subtracts step number from the value number so long as it stays within min/max (if they are
   * defined). If value is undefined, sets it to the step.
   */
  decrementValue() {
    const {min, step} = this.props;
    const {value} = this.state;

    let newValue = +value;
    if (isNaN(newValue)) {
      newValue = min != null ? Math.max(-step, min) : -step;
    } else {
      newValue = min != null ? Math.max(newValue - step, min) : newValue - step;
    }

    this.triggerChange(newValue);
  }

  /**
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
   * Updates state to the new value and notifies the onChange handler.
   */
  triggerChange(newValue) {
    const {onChange} = this.props;
    const {value} = this.state;

    // Only trigger change event and setState if the value changed
    if (value !== newValue) {
      this.setState({
        value: newValue,
        valueInvalid: this.isInputValueInvalid(newValue)
      });
      onChange(newValue);
    }
  }

  /**
   * If true, the input's value is currently invalid.
   */
  isInputValueInvalid(value) {
    const {max, min} = this.props;

    return value !== '' && isNaN(+value)
      || (max !== null && value > max || min !== null && value < min);
  }

  renderStepButton(props) {
    const {inputId} = this.state;

    return (
      <Button
        {...props}
        type="button"
        aria-controls={inputId}
        variant="secondary"
        iconSize="XS"
        tabIndex="-1"
        square
      />
    );
  }

  render() {
    const {
      defaultValue,
      placeholder,
      min,
      max,
      step,
      decrementTitle,
      incrementTitle,
      invalid,
      disabled,
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
        disabled={disabled}
        className={classNames('coral3-NumberInput', className)}>
        <span className="coral-InputGroup-button" role="presentation">
          {
            this.renderStepButton({
              className: 'coral-InputGroup-button coral3-NumberInput-stepUp',
              icon: 'chevronUp',
              title: incrementTitle,
              disabled: disabled || max != null && value >= max || readOnly,
              onClick: this.handleIncrementButtonClick
            })
          }
          {
            this.renderStepButton({
              className: 'coral-InputGroup-button coral3-NumberInput-stepDown',
              icon: 'chevronDown',
              title: decrementTitle,
              disabled: disabled || min != null && value <= min || readOnly,
              onClick: this.handleDecrementButtonClick
            })
          }
        </span>
        <Textfield
          className="coral-InputGroup-input"
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          role="spinbutton"
          aria-valuenow={value || ''}
          aria-valuetext={value || ''}
          aria-valuemin={min}
          aria-valuemax={max}
          invalid={invalid || valueInvalid}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={this.handleInputKeyDown}
          onWheel={this.handleInputScrollWheel}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          {...otherProps}
          onChange={this.handleInputChange}
        />
      </InputGroup>
    );
  }
}

NumberInput.displayName = 'NumberInput';
