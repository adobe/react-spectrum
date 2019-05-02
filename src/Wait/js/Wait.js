import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('circleloader');

const DETERMINATE = 'determinate';
const INDETERMINATE = 'indeterminate';

export default class Wait extends React.Component {
  static propTypes = {
    /** Whether to center the Wait compnent in the parent container. */
    centered: PropTypes.bool,

    /** Custom CSS class to add to the Wait component */
    className: PropTypes.string,

    /**
     * Boolean to determine if the Wait component should endlessly spin (indeterminate) or
     * if it should be controlled manually.
     */
    indeterminate: PropTypes.bool,

    /** Size of the Wait component */
    size: PropTypes.string,

    /** Adjust the filled portion of the Wait component to a determined value */
    value: PropTypes.number,

    /**
    * The variant of Wait to display.
    */
    variant: PropTypes.oneOf(['overBackground'])
  };

  render() {
    let {
      value = 0,
      size = 'M',
      indeterminate = true,
      centered = false,
      className,
      variant,
      ...otherProps
    } = this.props;

    // Determinate version has two high level masks, 1) right half, 2) left half
    // within each of those is a submask which rotates into view within that mask
    // but starts off on the opposite side so it's hidden
    // for first 50%, submask1 moves from -180 to 0 as it covers the first half
    // for the second 50%, submask1 stays in one place and submask2 rotates in
    // from -180 to 0
    let angle;
    let fillSubmask1Style = {};
    let fillSubmask2Style = {};
    let ariaValue = undefined;

    if (variant === DETERMINATE || variant === INDETERMINATE) {
      console.warn(`The "${variant}" variant of Wait is deprecated. Please use the "indeterminate" prop instead.`);
    }

    if (variant === DETERMINATE || !indeterminate) {
      value = Math.min(Math.max(+value, 0), 100);
      ariaValue = value;
      if (value > 0 && value <= 50) {
        angle = -180 + (value / 50 * 180);
        fillSubmask1Style.transform = 'rotate(' + angle + 'deg)';
        fillSubmask2Style.transform = 'rotate(-180deg)';
      } else if (value > 50) {
        angle = -180 + (value - 50) / 50 * 180;
        fillSubmask1Style.transform = 'rotate(0deg)';
        fillSubmask2Style.transform = 'rotate(' + angle + 'deg)';
      }
    }

    return (
      <div
        className={
          classNames(
            'spectrum-CircleLoader',
            {
              'spectrum-CircleLoader--indeterminate': variant === INDETERMINATE || (indeterminate && variant !== DETERMINATE),
              'spectrum-CircleLoader--small': size === 'S',
              'spectrum-CircleLoader--large': size === 'L',
              'spectrum-CircleLoader--overBackground': variant === 'overBackground',
              'react-spectrum-Wait--centered': centered
            },
            className
          )
        }
        role="progressbar"
        aria-valuenow={ariaValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...filterDOMProps(otherProps)}>
        <div className="spectrum-CircleLoader-track" />
        <div className="spectrum-CircleLoader-fills">
          <div className="spectrum-CircleLoader-fillMask1">
            <div className="spectrum-CircleLoader-fillSubMask1" style={fillSubmask1Style}>
              <div className="spectrum-CircleLoader-fill" />
            </div>
          </div>
          <div className="spectrum-CircleLoader-fillMask2">
            <div className="spectrum-CircleLoader-fillSubMask2" style={fillSubmask2Style}>
              <div className="spectrum-CircleLoader-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
