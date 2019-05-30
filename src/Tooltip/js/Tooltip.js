import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('tooltip');

export default class Tooltip extends Component {
  static propTypes = {
    /**
     * The placement of the tooltip.
     */
    placement: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),

    /**
     * The variant will affect color.
     */
    variant: PropTypes.oneOf(['inspect', 'info', 'success', 'error']),

    /**
     * The class name of the tooltip.
     */
    className: PropTypes.string,

    /**
     * The ID of the tooltip.
     */
    id: PropTypes.string,

    /**
     * The WAI-ARIA role for the tooltip
     */
    role: PropTypes.oneOf(['tooltip']),

    /**
     * Control if the tooltip should be opened or not.
     */
    open: PropTypes.bool
  };

  static defaultProps = {
    variant: 'inspect',
    placement: 'right',
    open: true,
    role: 'tooltip'
  };

  constructor(props) {
    super(props);
    this.tooltipId = createId();
  }

  render() {
    const {
      variant,
      children,
      arrowStyle,
      className,
      placement,
      open,
      id = this.tooltipId,
      ...otherProps
    } = this.props;

    return (
      <span
        className={
          classNames(
            'spectrum-Tooltip',
            `spectrum-Tooltip--${variant}`,
            `spectrum-Tooltip--${placement.split(' ')[0]}`,
            {
              'is-open': open
            },
            className
          )
        }
        id={id}
        {...filterDOMProps(otherProps)}>
        <span className="spectrum-Tooltip-label">{children}</span>
        <span className="spectrum-Tooltip-tip" style={arrowStyle} />
      </span>
    );
  }
}
