import CheckmarkSmall from '../../Icon/core/CheckmarkSmall';
import classNames from 'classnames';
import DashSmall from '../../Icon/core/DashSmall';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SwitchBase from '../../Switch/js/SwitchBase';

importSpectrumCSS('checkbox');

export default class Checkbox extends Component {
  static propTypes = {
    /**
     * Label for the checkbox
     */
    renderLabel: PropTypes.string,

    /**
     * defaultChecked is undefined by default so we can respect
     * the value that is passed in without erroneously putting
     * both checked and defaultChecked on the input
     */
    defaultChecked: PropTypes.bool,

    /**
     * if the checkbox can't be interacted with, and also greys it out
     */
    disabled: PropTypes.bool,

    /**
     * Uses standard HTML required to make a form invalid, also get a highlight if not filled in
     */
    required: PropTypes.bool,

    /**
     * If the value is invalid
     */
    invalid: PropTypes.bool,

    /**
     * Makes it so the checkbox can't be interacted with
     */
    readOnly: PropTypes.bool,

    /**
     * Callback for when the checkbox value changes
     */
    onChange: PropTypes.func,

    /**
     * Uses a dash instead of a check to indicate an in between or "unknown" state
     */
    indeterminate: PropTypes.bool

  };
  static defaultProps = {
    renderLabel: true,
    defaultChecked: undefined,
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false,
    onChange: function () {},
    indeterminate: false
  };

  componentDidMount() {
    this.setIndeterminate();
  }

  componentDidUpdate() {
    this.setIndeterminate();
  }

  // There is no way to set indeterminate through markup such that it will be picked up by a CSS
  // indeterminate pseudo-selector. It can only be done via javascript.
  setIndeterminate() {
    const {indeterminate} = this.props;
    const input = this.inputRef && this.inputRef.getInput();
    if (indeterminate != null && input) {
      input.indeterminate = indeterminate;
    }
  }

  render() {
    const {
      indeterminate,
      className,
      ...otherProps
    } = this.props;

    // override the aria-checked prop of SwitchBase only if it is indeterminate.
    if (indeterminate) {
      otherProps['aria-checked'] = 'mixed';
    }

    let markIcon = indeterminate
      ? <DashSmall size={null} className="spectrum-Checkbox-partialCheckmark" />
      : <CheckmarkSmall size={null} className="spectrum-Checkbox-checkmark" />;

    return (
      <SwitchBase
        ref={el => this.inputRef = el}
        inputType="checkbox"
        className={
          classNames(
            'spectrum-Checkbox',
            {'is-indeterminate': indeterminate},
            className
          )
        }
        inputClassName="spectrum-Checkbox-input"
        markClassName="spectrum-Checkbox-box"
        markIcon={markIcon}
        labelClassName="spectrum-Checkbox-label"
        {...otherProps} />
    );
  }
}

Checkbox.displayName = 'Checkbox';
