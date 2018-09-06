import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import responsive from './responsive';

/**
 * A column in a grid
 * Responsive modifiers enable specifying different column sizes, offsets, and distribution at xs, sm, md & lg viewport widths.
 */
export default class GridColumn extends Component {
  static propTypes = {
    /**
     * Custom classes to append to the grid column div
     */
    className: PropTypes.string,

    /**
     * How many columns to span
     */
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),

    /**
     * Reorders element to first depending on viewport width
     */
    first: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),

    /**
     * Reorders element to last depending on viewport width
     */
    last: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),

    /**
     * How many columns over should the element start, useful for blank area
     */
    offsetSize: PropTypes.number,
  };

  static defaultProps = {
    size: 'auto'
  };

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
