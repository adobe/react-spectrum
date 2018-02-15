import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default class Slider extends React.Component {
  static defaultProps = {
    min: 0,
    max: 1,
    step: 0,
    disabled: false,
    orientation: 'horizontal'
  };

  state = {
    startValue: null,
    endValue: null,
    draggingHandle: null
  };

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
      this.setState({startValue});
    }
  }

  onMouseDown = (e, sliderHandle) => {
    this.setState({
      draggingHandle: sliderHandle
    });

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    this.onMouseMove(e);
  };

  onMouseUp = (e) => {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    this.setState({
      draggingHandle: null
    });
  };

  getHandleValues = (value, step) => {
    let {startValue, endValue} = this.state;

    if (this.state.draggingHandle === 'startHandle') {
      startValue = value;
    }

    if (this.state.draggingHandle === 'endHandle') {
      endValue = value;
    }

    step = (!step) ? 0.05 : step;
    if (startValue + step > endValue) {
      return [this.state.startValue, this.state.endValue];
    } else {
      return [startValue, endValue];
    }
  }

  onMouseMove = (e) => {
    e.preventDefault();

    let rect = this.dom.getBoundingClientRect();
    let minOffset = this.props.orientation === 'vertical' ? rect.top : rect.left;
    let offset = this.props.orientation === 'vertical' ? e.clientY : e.clientX;
    let size = this.props.orientation === 'vertical' ? rect.height : rect.width;

    // Compute percentage
    let percent = (offset - minOffset) / size;
    percent = Math.max(0, Math.min(1, percent));
    if (this.props.orientation === 'vertical') {
      percent = 1 - percent;
    }

    // Compute real value based in min and max, and snap to nearest step.
    let {min, max, step} = this.props;
    let value = min + (max - min) * percent;
    if (step) {
      value = Math.round(value / step) * step;
    }

    if (this.props.variant === 'range') {
      let [startValue, endValue] = this.getHandleValues(value, step);
      if (this.props.onChange && (startValue !== this.state.startValue || endValue !== this.state.endValue)) {
        this.props.onChange(startValue, endValue);
      }

      if (this.props.startValue == null && this.props.endValue == null) {
        this.setState({startValue, endValue});
      }
    } else {
      if (this.props.onChange && value !== this.state.startValue) {
        this.props.onChange(value);
      }

      if (this.props.value == null) {
        this.setState({startValue: value});
      }
    }
  };


  renderSliderHandle = (sliderHandle) => {
    let {disabled, max, min, variant} = this.props;
    let {draggingHandle, isFocused} = this.state;
    let value = (sliderHandle === 'startHandle') ? this.state.startValue : this.state.endValue;
    let percent = (value - min) / (max - min);
    let styleKey = this.props.orientation === 'vertical' ? 'bottom' : 'left';
    return (
      <div
        className={classNames('spectrum-Slider-handle', {'is-dragged': draggingHandle === sliderHandle, 'is-focused': isFocused})}
        onMouseDown={e => !disabled && variant === 'range' ? this.onMouseDown(e, sliderHandle) : null}
        style={{[styleKey]: percent * 100 + '%'}}
        aria-disabled={disabled}>
        <input
          type="range"
          max={max}
          min={min}
          className="spectrum-Slider-input"
          aria-valuenow={value}
          disabled={disabled} />
      </div>
    );
  }

  render() {
    let {disabled, max, min, orientation, variant} = this.props;
    let sliderClasses = classNames('spectrum-Slider', this.props.className, {
      'spectrum-Slider--disabled': disabled,
      'spectrum-Slider--vertical': orientation === 'vertical'
    });
    return (
      <div
        className={sliderClasses}
        onMouseDown={e => !disabled && variant !== 'range' ? this.onMouseDown(e, 'startHandle') : null}
        ref={d => this.dom = d}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-orientation={orientation}
        aria-disabled={disabled}>
        <div className="spectrum-Slider-controls">
          <div className="spectrum-Slider-track" />
          {this.renderSliderHandle('startHandle')}
          {(variant === 'range') ? this.renderSliderHandle('endHandle') : null}
        </div>
      </div>
    );
  }
}
