import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('fieldlabel');

export default class Form extends Component {
  static propTypes = {
    /**
     * Custom classname to append to the form element
     */
    className: PropTypes.string
  };

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
