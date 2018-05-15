import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';

importSpectrumCSS('fieldlabel');

export default class Form extends Component {
  render() {
    const {
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <form
        className={
          classNames(
            'spectrum-Form',
            className
          )
        }
        {...filterDOMProps(otherProps)}>
        {children}
      </form>
    );
  }
}
