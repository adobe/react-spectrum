import autobind from 'autobind-decorator';
import {clamp, snapValueToStep} from '../../utils/number';
import classNames from 'classnames';
import createId from '../../utils/createId';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

const LABEL_POSTFIX = '-label';
const DRAGGED_BODY_CLASS_NAME = 'react-spectrum-Slider--round--is-dragged';

@autobind
export default class Dial extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    disabled: PropTypes.bool,
    renderLabel: PropTypes.bool,
    label: PropTypes.node,
    size: PropTypes.oneOf([null, 'S', 'L']),
    onChange: PropTypes.func
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 0,
    disabled: false,
    renderLabel: false,
    label: null,
    size: null,
    onChange() {}
  };

  state = {
    isDragging: false,
    isFocused: false
  };

  constructor(props) {
    super(props);
    this.dialId = createId();
    this.state.startValue = this.getStartValueFromProps(props);
  }

  componentWillReceiveProps(props) {
    const startValue = this.getStartValueFromProps(props);
    if (startValue != null) {
      this.setState({startValue});
    }
  }

  getStartValueFromProps(props) {
    // For single slider
    let startValue = props.value == null ? props.defaultValue : props.value;
    if (startValue == null && (this.state.startValue == null || this.props.max !== props.max || this.props.min !== props.min)) {
      startValue = props.min + (props.max - props.min) / 2;
    }
    return startValue;
  }

  onMouseDown(e) {
    // stop propagation of event up to .spectrum-Slider-controls
    e.stopPropagation();

    if (this.input) {
      this.input.focus();
    }

    this.setState({
      sliderHandle: null,
      isMouseUp: false,
      isDragging: true
    });

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    document.body.classList.add(DRAGGED_BODY_CLASS_NAME);
  }

  onMouseUp(e) {
    const {isDragging} = this.state;

    // Blur the input so that focused styling is removed with mouse/touch interaction.
    if (this.input && isDragging) {
      this.input.blur();
    }

    this.setState({
      isMouseUp: true,
      isDragging: false
    }, () => {
      // Restore focus to the input so that keyboard interaction will continue to work.
      if (this.input) {
        this.input.focus();
      }
    });

    if (this.props.onChangeEnd) {
      this.props.onChangeEnd(this.state.startValue);
    }

    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    document.body.classList.remove(DRAGGED_BODY_CLASS_NAME);
  }

  calculateHandlePosition(e) {
    const {min, max, step} = this.props;

    const rect = this.dom.getBoundingClientRect();
    const minOffset = rect.top;
    const offset = e.clientY;
    const size = rect.height;

    // Compute percentage
    let percent = (offset - minOffset) / size;
    percent = 1 - clamp(percent, 0, 1);

    // Compute real value based in min and max, and snap to nearest step.
    let value = min + (max - min) * percent;
    if (step) {
      value = Math.round(value / step) * step;
    }

    return value;
  }

  onMouseMove(e) {
    e.preventDefault();

    let value = this.calculateHandlePosition(e);
    this.updateValues(value);
  }

  updateValues(startValue) {
    const {min, max, step, onChange} = this.props;

    startValue = snapValueToStep(startValue, min, max, step);

    if (onChange && startValue !== this.state.startValue) {
      onChange(startValue);
    }

    // If value is not set in props (uncontrolled component), set state
    if (this.props.value == null) {
      this.setState({startValue: startValue, isFocused: !this.state.isMouseUp});
    }
  }

  onChange(e) {
    const {startValue} = this.state;
    const inputValue = +e.target.value;
    if (inputValue !== startValue) {
      this.updateValues(inputValue);
    }
  }

  onFocus() {
    this.setState({
      isFocused: !this.state.isMouseUp,
      isMouseUp: false
    });
  }

  onBlur() {
    this.setState({
      isFocused: false
    });
  }

  onClickValue() {
    if (this.input) {
      this.input.focus();
    }
  }

  getLabelId() {
    return this.dialId + LABEL_POSTFIX;
  }

  getInputId() {
    const {id = this.dialId} = this.props;
    return id;
  }

  getAriaLabelledby() {
    const label = this.props.label;
    const ariaLabelledby = this.props['aria-labelledby'];
    const ariaLabel = this.props['aria-label'];
    const ids = [];

    if (ariaLabelledby) {
      ids.push(ariaLabelledby);
    }

    if (label || ariaLabel) {
      ids.push(this.getLabelId());
    }

    return ids.join(' ');
  }

  renderHandle() {
    const {
      disabled,
      max,
      min,
      step,
      ...otherProps
    } = this.props;
    const {isDragging, isFocused, startValue} = this.state;
    const value = startValue;
    const percent = (value - min) / (max - min);
    let ariaLabel = otherProps['aria-label'];

    return (
      <div
        className={classNames('spectrum-Slider-handle', {
          'is-dragged': isDragging,
          'is-focused': isFocused
        })}
        style={{
          'transform': 'rotate(' + (percent * 270 - 45) + 'deg)'
        }}
        role="presentation">
        <input
          id={this.getInputId()}
          ref={i => this.input = i}
          type="range"
          className="spectrum-Slider-input"
          step={step}
          max={max}
          min={min}
          disabled={disabled}
          aria-orientation="vertical"
          aria-label={ariaLabel || null}
          aria-labelledby={this.getAriaLabelledby()}
          aria-describedby={otherProps['aria-describedby'] || null}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={value}
          value={value}
          onChange={!disabled ? this.onChange : null}
          onFocus={!disabled ? this.onFocus : null}
          onBlur={!disabled ? this.onBlur : null} />
      </div>
    );
  }

  render() {
    let {
      disabled,
      id = this.dialId,
      label,
      renderLabel,
      size,
      ...otherProps
    } = this.props;
    const {startValue} = this.state;
    const sliderClasses = classNames(
      'spectrum-Slider',
      'spectrum-Slider--vertical',
      'spectrum-Slider--round',
      'react-spectrum-Slider--round',
      this.props.className, {
        'spectrum-Slider--round--small': size === 'S',
        'is-disabled': disabled
      });
    const shouldRenderLabel = renderLabel && label;
    const ariaLabel = otherProps['aria-label'];
    const ariaLabelledby = this.getAriaLabelledby();
    const labelValue = startValue;

    return (
      <div
        className={sliderClasses}
        ref={d => this.dom = d}
        role="presentation">
        {(shouldRenderLabel || (label && ariaLabelledby) || ariaLabel) &&
          <div className="spectrum-Slider-labelContainer">
            <label
              id={this.getLabelId()}
              className="spectrum-Slider-label"
              htmlFor={id}
              hidden={!shouldRenderLabel || null}
              aria-label={!otherProps['aria-labelledby'] ? ariaLabel : null}>
              {label}
            </label>
            {shouldRenderLabel &&
              <div className="spectrum-Slider-value" role="textbox" aria-readonly="true" aria-labelledby={ariaLabelledby} onClick={!disabled ? this.onClickValue : null}>
                {labelValue}
              </div>
            }
          </div>
        }
        <div
          className="spectrum-Slider-controls"
          role="presentation"
          onMouseDown={!disabled ? this.onMouseDown : null}>
          {this.renderHandle()}
        </div>
      </div>
    );
  }
}
