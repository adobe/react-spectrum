import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('banner');

const variants = [
  'info', 'warning', 'error'
];

/**
 * A banner is a label with a few specific states that optionally allows for corner placement.
 */
export default function Banner({header, content, variant = variants[0], corner, className, ...otherProps}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Banner',
          `spectrum-Banner--${variant}`,
          {['spectrum-Banner--corner']: !!corner},
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      <div className="spectrum-Banner-header">{header}</div>
      <div className="spectrum-Banner-content">{content}</div>
    </div>
  );
}

Banner.displayName = 'Banner';

Banner.propTypes = {
  /** Content to show in the larger header portion of the Banner */
  header: PropTypes.string,
  /** Content to show below the header portion of the Banner */
  content: PropTypes.string,
  /** Variant of Banner to render */
  variant: PropTypes.oneOf(variants),
  /** Whether to absolutely place the Banner in the top-right corner of the containing element */
  corner: PropTypes.bool
};
