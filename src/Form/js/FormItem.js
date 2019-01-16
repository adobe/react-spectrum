import classNames from 'classnames';
import LabelBase from '../../FieldLabel/js/LabelBase';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class FormItem extends Component {
  static propTypes = {
    /** Label for form field. Can be Text of HTML */
    label: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    /** Label Alignment. Defaults to left */
    labelAlign: PropTypes.oneOf(['left', 'right']),
    /** Id of the labelable form element */
    labelFor: PropTypes.string
  };

  static defaultProps = {
    labelAlign: 'left'
  };

  render() {
    const {
      label,
      labelAlign,
      labelFor,
      className,
      children,
      ...otherProps
    } = this.props;

    let labelClassNames = classNames(
      'spectrum-Form-itemLabel',
      `spectrum-FieldLabel--${labelAlign}`
    );

    return (
      <LabelBase
        label={label}
        className={classNames('spectrum-Form-item', className)}
        labelClassName={labelClassNames}
        wrapperClassName="spectrum-Form-itemField"
        labelFor={labelFor}
        componentName="FormItem"
        {...otherProps}>
        {children}
      </LabelBase>
    );
  }
}
