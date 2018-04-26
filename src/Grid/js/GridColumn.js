import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';
import responsive from './responsive';

export default class GridColumn extends Component {
  static defaultProps = {
    size: 'auto'
  }

  render() {
    const {
      className,
      children,
      size,
      first,
      last,
      offsetSize,
      ...otherProps
    } = this.props;

    let classes = classNames(
      responsive('spectrum-grid-col-#size-#value', size),
      responsive('spectrum-grid-col-#size-offset-#value', offsetSize),
      responsive('spectrum-grid-first-#size', first),
      responsive('spectrum-grid-last-#size', last),
      className
    );

    return (
      <div className={classes} {...filterDOMProps(otherProps)}>
        {children}
      </div>
    );
  }
}
