import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('banner');

const variants = [
  'info', 'warning', 'error'
];

export default function Banner({header, content, variant = variants[0], corner, ...otherProps}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Banner',
          `spectrum-Banner--${variant}`,
          {['spectrum-Banner--corner']: !!corner}
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
  header: PropTypes.string,
  content: PropTypes.string,
  variant: PropTypes.oneOf(variants),
  corner: PropTypes.bool
};
