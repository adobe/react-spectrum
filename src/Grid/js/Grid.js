import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';
import '../style/index.styl';

export default class Grid extends Component {
  static defaultProps = {
    variant: 'fluid'
  }

  render() {
    const {
      variant,
      className,
      children,
      ...otherProps
    } = this.props;

    let classes = classNames({
      'spectrum-grid--fixed': variant === 'fixed',
      'spectrum-grid--fluid': variant === 'fluid'
    }, className);

    return (
      <div className={classes} {...filterDOMProps(otherProps)}>
        {children}
      </div>
    );
  }
}
