import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

const variants = [
  'grey', 'green', 'blue', 'red', 'orange', 'and', 'or', 'active', 'inactive'
];

export default function Label({size, children, variant = variants[0], ...otherProps}) {
  const sizeClassPart = {L: 'large'}[size];

  return (
    <span
      className={
        classNames(
          'spectrum-Label',
          `spectrum-Label--${variant}`,
          {[`spectrum-Label--${sizeClassPart}`]: !!sizeClassPart}
        )
      }
      {...otherProps}>
      {children}
    </span>
  );
}

Label.displayName = 'Label';

Label.propTypes = {
  size: PropTypes.string,
  variant: PropTypes.oneOf(variants)
};
