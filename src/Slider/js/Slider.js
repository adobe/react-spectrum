import {clamp, snapValueToStep} from '../../utils/number';
import classNames from 'classnames';
import createId from '../../utils/createId';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('slider');

const formatMessage = messageFormatter(intlMessages);

const INPUT_POSTFIX = 'Input';
const LABEL_POSTFIX = '-label';
const STYLE_KEY = {
  FILL: {
    horizontal: 'width',
    vertical: 'height'
  },
  OFFSET: {
    horizontal: 'left',
    vertical: 'bottom'
  },
  OPPOSITE_OFFSET: {
    horizontal: 'right',
    vertical: 'top'
  }
};

export default class Slider extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    disabled: PropTypes.bool,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    renderLabel: PropTypes.bool,
    label: PropTypes.node,
    filled: PropTypes.bool,
    variant: PropTypes.oneOf([null, 'ramp', 'range']),
    size: PropTypes.oneOf([null, 'S', 'L']),
    onChange: PropTypes.func
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 0,
    disabled: false,
    orientation: 'horizontal',
    renderLabel: false,
    label: null,
    filled: false,
    variant: null,
    size: null,
    onChange() {}
  };

  state = {
    startValue: null,
    endValue: null,
    draggingHandle: null,
    focusedHandle: null
  };

  constructor(props) {
    super(props);
    this.sliderId = createId();
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // For range slider
    if (props.variant === 'range') {
      let startValue = (props.startValue == null) ? props.defaultStartValue : props.startValue;
      let endValue = (props.endValue == null) ? props.defaultEndValue : props.endValue;
      if (startValue == null && (this.state.startValue == null || this.props.min !== props.min)) {
        startValue = props.min;
      }
      if (endValue == null && (this.state.endValue == null || this.props.max !== props.max)) {
        endValue = props.max;
      }
      if (startValue != null && endValue != null) {
        this.setState({startValue, endValue});
      }
    } else {
      // For single slider
      let startValue = props.value == null ? props.defaultValue : props.value;
      if (startValue == null && (this.state.startValue == null || this.props.max !== props.max || this.props.min !== props.min)) {
        startValue = props.min + (props.max - props.min) / 2;
      }
      if (startValue != null) {
        this.setState({startValue});
      }
    }
    this.isDraggedBodyClassName = 'u-isGrabbing';
  }

  /**
   * Finds the nearest handle based on X/Y coordinates
   *  @private
   */
  findNearestHandle = (pageX, pageY) => {
    let closestDistance = Infinity; // Incredible large start value
    let closestHandle = 'startHandle';
    const handles = ['startHandle', 'endHandle'];

    // if variant is not range always return focused handle
    if (this.props.variant !== 'range') {
      return closestHandle;
    }

    // Find the nearest handle
    handles.forEach(handle => {
      const rect = this[handle + INPUT_POSTFIX].getBoundingClientRect();
      const top = rect.top + window.pageYOffset;
      const left = rect.left + window.pageXOffset;
      const distance = Math.floor(
        Math.sqrt(Math.pow(pageX - (left + (rect.width / 2)), 2) +
          Math.pow(pageY - (top + (rect.height / 2)), 2))
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestHandle = handle;
      }
    });

    return closestHandle;
  }


  onMouseDown = (e, sliderHandle) => {
    if (!sliderHandle) {
      sliderHandle = this.findNearestHandle(e.pageX, e.pageY);
    } else {
      // stop propagation of event up to .spectrum-Slider-controls
      e.stopPropagation();
    }

    const input = this[sliderHandle + INPUT_POSTFIX];

    if (input) {
      input.focus();
    }

    // persist event for use after state change
    e.persist();

    this.setState({
      sliderHandle: null,
      isMouseUp: false,
      draggingHandle: sliderHandle
    }, () => this.onMouseMove(e));

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    document.body.classList.add(this.isDraggedBodyClassName);
  };

  onMouseUp = (e) => {
    const {draggingHandle} = this.state;
    const input = draggingHandle && this[draggingHandle + INPUT_POSTFIX];

    // Blur the input so that focused styling is removed with mouse/touch interaction.
    if (input) {
      input.blur();
    }

    this.setState({
      isMouseUp: true,
      draggingHandle: null
    }, () => {
      // Restore focus to the input so that keyboard interaction will continue to work.
      if (input) {
        input.focus();
      }
    });

    if (this.props.onChangeEnd) {
      if (this.props.variant === 'range') {
        this.props.onChangeEnd(this.state.startValue, this.state.endValue);
      } else {
        this.props.onChangeEnd(this.state.startValue);
      }
    }

    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    document.body.classList.remove(this.isDraggedBodyClassName);
  };

  calculateHandlePosition = (e) => {
    const {min, max, orientation, step} = this.props;
    const vertical = orientation === 'vertical';

    const rect = this.dom.getBoundingClientRect();
    const minOffset = vertical ? rect.top : rect.left;
    const offset = vertical ? e.clientY : e.clientX;
    const size = vertical ? rect.height : rect.width;

    // Compute percentage
    let percent = (offset - minOffset) / size;
    percent = clamp(percent, 0, 1);
    if (vertical) {
      percent = 1 - percent;
    }

    // Compute real value based in min and max, and snap to nearest step.
    let value = min + (max - min) * percent;
    if (step) {
      value = Math.round(value / step) * step;
    }

    return value;
  };

  getHandleValues = (value, step) => {
    let {draggingHandle, startValue, endValue} = this.state;

    if (draggingHandle === 'startHandle') {
      startValue = value;
    }

    if (draggingHandle === 'endHandle') {
      endValue = value;
    }


    step = (!step) ? 1 : step;
    if (+startValue + step > endValue) {
      return [this.state.startValue, this.state.endValue];
    } else {
      return [startValue, endValue];
    }
  };

  onMouseMove = (e) => {
    e.preventDefault();

    let value = this.calculateHandlePosition(e);
    if (this.props.variant === 'range') {
      let [startValue, endValue] = this.getHandleValues(value, this.props.step);
      this.updateValues(startValue, endValue, this.state.draggingHandle);
    } else {
      this.updateValues(value, null, 'startHandle');
    }
  };

  updateValues = (startValue, endValue = null, sliderHandle = null) => {
    const {min, max, step, variant, onChange} = this.props;

    startValue = snapValueToStep(startValue, min, max, step);

    if (variant === 'range') {
      endValue = snapValueToStep(endValue, min, max, step);

      if (onChange && (startValue !== this.state.startValue || endValue !== this.state.endValue)) {
        onChange(startValue, endValue);
      }

      if (this.props.startValue == null && this.props.endValue == null) {
        this.setState({startValue, endValue, focusedHandle: !this.state.isMouseUp ? sliderHandle : null});
      }
    } else {
      if (onChange && startValue !== this.state.startValue) {
        onChange(startValue);
      }

      // If value is not set in props (uncontrolled component), set state
      if (this.props.value == null) {
        this.setState({startValue: startValue, focusedHandle: !this.state.isMouseUp ? sliderHandle : null});
      }
    }
  };

  onChange = (e, sliderHandle) => {
    const {step, variant} = this.props;
    const {startValue, endValue} = this.state;
    const isStartHandle = sliderHandle === 'startHandle';
    const value = isStartHandle ? startValue : endValue;
    const inputValue = +e.target.value;
    if (inputValue !== value) {
      if (variant === 'range') {
        this.setState({
          draggingHandle: sliderHandle
        }, () => {
          let [startValue, endValue] = this.getHandleValues(inputValue, step);
          this.updateValues(startValue, endValue, sliderHandle);
          this.setState({draggingHandle: null});
        });
      } else {
        this.updateValues(inputValue, null, sliderHandle);
      }
    }
  };

  onFocus = (e, sliderHandle) => {
    this.setState({
      focusedHandle: !this.state.isMouseUp ? sliderHandle : null,
      topHandle: sliderHandle,
      isMouseUp: false
    });
  };

  onBlur = (e, sliderHandle) => {
    this.setState({
      focusedHandle: null
    });
  };

  onClickSliderValue = (e) => {
    const selection = window.getSelection();
    let sliderHandle = 'startHandle';

    /* Clicking the portion of the slider value text label after the en-dash character should move focus to the endHandle. */
    if (this.props.variant === 'range' && selection.focusOffset > e.target.textContent.indexOf('–')) {
      sliderHandle = 'endHandle';
    }

    this[sliderHandle + INPUT_POSTFIX].focus();
  };

  getLabelId() {
    return this.sliderId + LABEL_POSTFIX;
  }

  getSliderHandleInputId(sliderHandle) {
    const {id = this.sliderId} = this.props;
    return sliderHandle === 'startHandle' ? id : id + '-' + sliderHandle + INPUT_POSTFIX;
  }

  getAriaLabelledby = (sliderHandle = null) => {
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

    if (sliderHandle) {
      ids.push(this.getSliderHandleInputId(sliderHandle));
    }

    return ids.join(' ');
  };

  renderSliderHandle = (sliderHandle) => {
    const {
      disabled,
      max,
      min,
      orientation,
      step,
      variant,
      ...otherProps
    } = this.props;
    const {draggingHandle, focusedHandle, topHandle, startValue, endValue} = this.state;
    const isStartHandle = sliderHandle === 'startHandle';
    const value = isStartHandle ? startValue : endValue;
    const percent = (value - min) / (max - min);
    const isRange = variant === 'range';
    const isVertical = orientation === 'vertical';
    const isDragged = draggingHandle === sliderHandle;
    const isFocused = focusedHandle === sliderHandle;
    const isTopHandle = topHandle === sliderHandle;
    let styleKey = STYLE_KEY.OFFSET[orientation];
    const labelString = isStartHandle ? formatMessage('minimum') : formatMessage('maximum');
    let ariaLabel = otherProps['aria-label'];
    let ariaValueMin = null;
    let ariaValueMax = null;

    if (isRange) {
      ariaLabel = labelString;
      ariaValueMin = isStartHandle ? min : startValue;
      ariaValueMax = isStartHandle ? endValue : max;
    }

    return (
      <div
        className={classNames('spectrum-Slider-handle', {
          'is-dragged': isDragged,
          'is-focused': isFocused,
          'is-tophandle': isTopHandle
        })}
        onMouseDown={!disabled && isRange ? e => this.onMouseDown(e, sliderHandle) : null}
        style={{
          [styleKey]: percent * 100 + '%'
        }}
        role="presentation">
        <input
          id={this.getSliderHandleInputId(sliderHandle)}
          ref={i => this[sliderHandle + INPUT_POSTFIX] = i}
          type="range"
          className="spectrum-Slider-input"
          step={step}
          max={max}
          min={min}
          disabled={disabled}
          aria-orientation={isVertical ? orientation : null}
          aria-label={ariaLabel || null}
          aria-labelledby={this.getAriaLabelledby(isRange ? sliderHandle : null)}
          aria-describedby={otherProps['aria-describedby'] || null}
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
          aria-valuetext={value}
          defaultValue={undefined}
          value={value}
          onChange={!disabled ? e => this.onChange(e, sliderHandle) : null}
          onFocus={!disabled ? e => this.onFocus(e, sliderHandle) : null}
          onBlur={!disabled ? e => this.onBlur(e, sliderHandle) : null} />
      </div>
    );
  };

  render() {
    let {
      children,
      disabled,
      filled,
      id = this.sliderId,
      label,
      max,
      min,
      orientation,
      renderLabel,
      variant,
      ...otherProps
    } = this.props;
    const {startValue, endValue} = this.state;
    const isRamp = variant === 'ramp';
    const isRange = variant === 'range';
    const isVertical = orientation === 'vertical';
    const sliderClasses = classNames('spectrum-Slider', this.props.className, {
      'spectrum-Slider--vertical': isVertical,
      'spectrum-Slider--ramp': isRamp,
      'spectrum-Slider--range': isRange,
      'spectrum-Slider--filled': filled,
      'is-disabled': disabled
    });
    const shouldRenderLabel = renderLabel && label;
    const ariaLabel = otherProps['aria-label'];
    const ariaLabelledby = this.getAriaLabelledby();
    const labelValue = isRange ? [startValue, endValue].join('–') : startValue;
    const delta = isRange ? (endValue - startValue) : (startValue - min);
    const valueRange = max - min;
    const percent = delta / valueRange;
    const styleKeyFill = STYLE_KEY.FILL[orientation];
    const styleKeyOffset = STYLE_KEY.OFFSET[orientation];
    const styleKeyOppositeOffset = STYLE_KEY.OPPOSITE_OFFSET[orientation];

    const startPercent = (startValue - min) / (max - min);
    const endPercent = (endValue - min) / (max - min);

    if (isRamp) {
      children = null;
    }

    // Range slider should always be filled
    if (isRange && !filled) {
      filled = true;
    }

    return (
      <div
        className={sliderClasses}
        ref={d => this.dom = d}
        role={isRange ? 'group' : 'presentation'}
        aria-labelledby={isRange ? ariaLabelledby : null}>
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
              <div className="spectrum-Slider-value" role="textbox" aria-readonly="true" aria-labelledby={ariaLabelledby} onClick={!disabled ? e => this.onClickSliderValue(e) : null}>
                {labelValue}
              </div>
            }
          </div>
        }
        <div
          className="spectrum-Slider-controls"
          role="presentation"
          onMouseDown={!disabled ? e => this.onMouseDown(e) : null}>
          {!isRamp &&
            <div
              className="spectrum-Slider-track"
              role="presentation"
              style={{
                [styleKeyFill]: (isRange ? startPercent : percent) * 100 + '%'
              }} />
          }
          {isRamp &&
            <div className="spectrum-Slider-ramp">
              <svg width="100%" viewBox="0 0 240 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M240,4v8c0,2.3-1.9,4.1-4.2,4L1,9C0.4,9,0,8.5,0,8c0-0.5,0.4-1,1-1l234.8-7C238.1-0.1,240,1.7,240,4z" />
              </svg>
            </div>
          }
          {children}
          {this.renderSliderHandle('startHandle')}
          {isRange &&
            <div
              className="spectrum-Slider-track"
              role="presentation"
              style={{
                [styleKeyOffset]: startPercent * 100 + '%',
                [styleKeyOppositeOffset]: (1 - endPercent) * 100 + '%'
              }} />
          }
          {isRange ? this.renderSliderHandle('endHandle') : null}
          {!isRamp &&
            <div
              className="spectrum-Slider-track"
              role="presentation"
              style={{
                [styleKeyFill]: (1 - (isRange ? endPercent : percent)) * 100 + '%'
              }} />
          }
        </div>
      </div>
    );
  }
}
