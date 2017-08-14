import classNames from 'classnames';
import React, {Component} from 'react';
import responsive from './responsive';

export default class GridRow extends Component {
  static defaultProps = {
    reverse: false
  }

  render() {
    const {
      align,
      children,
      valign,
      distribution,
      reverse,
      className,
      ...otherProps
    } = this.props;

    let classes = classNames(
      'spectrum-grid-row',
      responsive('spectrum-grid-#value-#size', align),
      responsive('spectrum-grid-#value-#size', valign),
      responsive('spectrum-grid-#value-#size', distribution),
      {'spectrum-grid-reverse': reverse},
      className
    );

    return (
      <div className={classes} {...otherProps}>
        {children}
      </div>
    );
  }
}
