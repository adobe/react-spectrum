import React, {Component} from 'react';

export default class MenuHeading extends Component {
  static displayName = 'MenuHeading';

  render() {
    const {
      label,
      children,
      role = 'presentation',
      ...otherProps
    } = this.props;

    let ariaLevel = otherProps['aria-level'];
    delete otherProps['aria-level'];

    return (
      <li role={role} className="spectrum-Menu-sectionHeading" {...otherProps} >
        <span role="heading" aria-level={ariaLevel || 3}>
          { label || children }
        </span>
      </li>
    );
  }
}
