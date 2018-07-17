import React, {Component} from 'react';

export default class MenuHeading extends Component {
  static displayName = 'MenuHeading';

  render() {
    const {
      label,
      children,
      ...otherProps
    } = this.props;

    return (
      <h4 className="spectrum-Menu-sectionHeading" {...otherProps}>
        { label || children }
      </h4>
    );
  }
}
