import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import {focusAfterMouseEvent} from '../../utils/events';
import focusRing from '../../utils/focusRing';
import React, {Component} from 'react';

@focusRing
export default class SwitchBase extends Component {
  static defaultProps = {
    renderLabel: true,
    // defaultChecked is undefined by default so we can repect
    // the value that is passed in without erroneously putting
    // both checked and defaultChecked on the input
    defaultChecked: undefined,
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false,
    onChange: function () {}
  };

  constructor(props) {
    super(props);

    const {
      checked,
      defaultChecked
    } = props;

    this.state = {
      checked: checked !== undefined ? checked : defaultChecked || false
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({
        checked: nextProps.checked
      });
    }
  }

  focus() {
    if (this.inputRef && !this.disabled) {
      this.inputRef.focus();
    }
  }

  setChecked(checked) {
    if (!('checked' in this.props)) {
      this.setState({
        checked
      });
    }
  }

  getInput() {
    return this.inputRef;
  }

  handleChange = e => {
    const {onChange} = this.props;
    const {checked} = e.target;

    this.setChecked(checked);
    onChange(checked, e);
  }

  render() {
    const {
      label,
      value,
      name,
      disabled,
      required,
      invalid,
      readOnly,
      className,
      children,
      inputType,
      renderLabel,
      inputClassName,
      markClassName,
      markIcon,
      labelClassName,
      onBlur,
      onFocus,
      onMouseDown,
      onMouseUp,
      ...otherProps
    } = this.props;
    const {checked} = this.state;
    const shouldRenderLabel = renderLabel && (label || children);
    const Element = shouldRenderLabel ? 'label' : 'div';

    // Don't let native browser change events bubble up to the root div.
    // Otherwise we double dispatch.
    delete otherProps.onChange;

    return (
      <Element
        className={
          classNames(
            className,
            {'is-invalid': invalid, 'is-disabled': disabled}
          )
        }>
        <input
          ref={el => this.inputRef = el}
          type={inputType}
          className={inputClassName}
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
          required={required ? true : null}
          readOnly={readOnly}
          onChange={this.handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onMouseDown={focusAfterMouseEvent.bind(this, onMouseDown)}
          onMouseUp={focusAfterMouseEvent.bind(this, onMouseUp)}
          aria-invalid={invalid || null}
          aria-checked={checked}
          {...filterDOMProps(otherProps)} />
        <span className={markClassName}>{markIcon}</span>
        {shouldRenderLabel &&
          <span className={labelClassName}>
            {label}
            {children}
          </span>
        }
      </Element>
    );
  }
}

SwitchBase.displayName = 'SwitchBase';
