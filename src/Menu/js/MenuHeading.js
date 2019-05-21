import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';

export default class MenuHeading extends Component {
  static displayName = 'MenuHeading';

  render() {
    const {
      label,
      children,
      role = 'presentation',
      'aria-level': ariaLevel,
      ...otherProps
    } = this.props;

    return (
      <li role={role} className="spectrum-Menu-sectionHeading" {...filterDOMProps(otherProps)} >
        <span role="heading" aria-level={ariaLevel || 3}>
          { label || children }
        </span>
      </li>
    );
  }
}
