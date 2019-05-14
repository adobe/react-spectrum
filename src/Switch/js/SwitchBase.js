import autobind from 'autobind-decorator';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import {focusAfterMouseEvent} from '../../utils/events';
import focusRing from '../../utils/focusRing';
import {getTextFromReact} from '../../utils/string';
import React, {Component} from 'react';

@focusRing
@autobind
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

  handleChange(e) {
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
      style,
      children,
      inputType,
      renderLabel,
      inputClassName,
      markClassName,
      markIcon,
      labelClassName,
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

    // Add aria-label that concatenates label and children
    // when renderLabel is false and no other aria-label is provided.
    let ariaLabel = null;
    if (otherProps['aria-label']) {
      ariaLabel = otherProps['aria-label'];
      delete otherProps['aria-label'];
    } else if (!renderLabel && (label || children)) {
      let labels = [];
      if (label) {
        labels.push(label);
      }
      if (children) {
        let str = getTextFromReact(children);
        if (str !== label) {
          labels.push(str);
        }
      }
      ariaLabel = labels.join(' ');
    }

    // Fix for ESLint error: The attribute aria-checked is not supported by the role textbox. This role is implicit on the element input  jsx-a11y/role-supports-aria-props
    if (inputType && !otherProps['aria-checked']) {
      otherProps['aria-checked'] = checked;
    }

    return (
      <Element
        className={
          classNames(
            className,
            {'is-invalid': invalid, 'is-disabled': disabled}
          )
        }
        style={style}>
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
          onMouseDown={focusAfterMouseEvent.bind(this, onMouseDown)}
          onMouseUp={focusAfterMouseEvent.bind(this, onMouseUp)}
          aria-invalid={invalid || null}
          aria-label={ariaLabel}
          {...filterDOMProps(otherProps)} />
        <span className={markClassName}>{markIcon}</span>
        {shouldRenderLabel &&
          <span className={labelClassName}>
            {label}
            {/* When both label and children are present,
              include a space character so that the text
              doesn't get smushed together. */
              label && children && ' '}
            {children}
          </span>
        }
      </Element>
    );
  }
}

SwitchBase.displayName = 'SwitchBase';
