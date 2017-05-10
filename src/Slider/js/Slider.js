import classNames from 'classnames';
import React from 'react';

import '../style/index.styl';

export default class Slider extends React.Component {
  static defaultProps = {
    min: 0,
    max: 1,
    step: 0,
    isDisabled: false,
    orientation: 'horizontal'
  };

  state = {
    value: null,
    isDragging: false
  };

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    let value = props.value == null ? props.defaultValue : props.value;
    if (value == null && (this.state.value == null || this.props.max !== props.max || this.props.min !== props.min)) {
      value = props.min + (props.max - props.min) / 2;
    }

    this.setState({value});
  }

  onMouseDown = (e) => {
    this.setState({
      isDragging: true
    });

    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    this.onMouseMove(e);
  };

  onMouseUp = (e) => {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);

    this.setState({
      isDragging: false
    });
  };

  onMouseMove = (e) => {
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

    // Emit onChange event
    if (this.props.onChange && value !== this.state.value) {
      this.props.onChange(value);
    }

    // If value is not set in props (uncontrolled component), set state
    if (this.props.value == null) {
      this.setState({value});
    }
  };

  render() {
    let {isDisabled, max, min, orientation, step} = this.props;
    let {isDragging, isFocused, value} = this.state;
    let percent = (value - min) / (max - min);
    let styleKey = this.props.orientation === 'vertical' ? 'bottom' : 'left';
    let sliderClasses = classNames('coral3-Slider', {
      'is-disabled': isDisabled,
      'coral3-Slider--vertical': orientation === 'vertical'},
      this.props.className
    );
    return (
      <div
        className={sliderClasses}
        onMouseDown={this.onMouseDown}
        ref={d => this.dom = d}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation={orientation}
        aria-disabled={isDisabled}>
          <div className="coral3-Slider-bar" />
          <div
            className={classNames('coral3-Slider-handle', {'is-dragged': isDragging, 'is-focused': isFocused})}
            onMouseDown={!isDisabled && this.onMouseDown}
            style={{[styleKey]: percent * 100 + '%'}}
            aria-disabled={isDisabled}>
              <input
                type="range"
                className="coral3-Slider-input"
                step={step}
                max={max}
                min={min}
                disabled={isDisabled} />
          </div>
      </div>
    );
  }
}
