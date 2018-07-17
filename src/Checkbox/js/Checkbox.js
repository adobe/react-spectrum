import CheckmarkSmall from '../../Icon/core/CheckmarkSmall';
import classNames from 'classnames';
import DashSmall from '../../Icon/core/DashSmall';
import React, {Component} from 'react';
import SwitchBase from '../../Switch/js/SwitchBase';

importSpectrumCSS('checkbox');

export default class Checkbox extends Component {
  static defaultProps = {
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
