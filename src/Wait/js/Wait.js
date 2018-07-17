import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('circleloader');

const DETERMINATE = 'determinate';
const INDETERMINATE = 'indeterminate';

export default function Wait({
  value = 0,
  size = 'M',
  centered = false,
  className,
  variant = INDETERMINATE,
  ...otherProps
}) {

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

  if (variant === DETERMINATE) {
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
            'spectrum-CircleLoader--indeterminate': variant === INDETERMINATE,
            'spectrum-CircleLoader--small': size === 'S',
            'spectrum-CircleLoader--large': size === 'L',
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

Wait.displayName = 'Wait';
