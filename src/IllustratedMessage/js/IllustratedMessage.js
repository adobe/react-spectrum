/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import Heading from '../../Heading';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('illustratedmessage');

/**
 * An IllustratedMessage displays an illustration icon and a message, usually in an empty state or on an error page.
 */
export default class IllustratedMessage extends React.Component {
  static propTypes = {
    /** The heading to be displayed */
    heading: PropTypes.string,

    /** The description to be displayed */
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** The illustration to be rendered above heading. Should be an SVG element. */
    illustration: PropTypes.element,

    /** The heading level for the heading element to preserve hierarchy of headings in web page for accessibility. */
    ariaLevel: PropTypes.number
  };

  static defaultProps = {
    heading: null,
    description: null
  };

  isIllustrationDecorative() {
    const {
      illustration,
      heading,
      description
    } = this.props;

    if (illustration) {
      const {
        props
      } = illustration;

      const {
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-hidden': ariaHidden
      } = props;

      // If illustration is explicitly hidden for accessibility return the ariaHidden value.
      if (ariaHidden != null) {
        return ariaHidden;
      }

      // If illustration is explicitly labelled using aria-label or aria-labelledby return null.
      if (ariaLabel || ariaLabelledby) {
        return false;
      }
    }

    // Otherwise, assume the image is decorative.
    return !!(heading || description);
  }

  render() {
    let {
      illustration = null,
      className,
      heading,
      description,
      ariaLevel,
      ...otherProps
    } = this.props;

    if (illustration && (!illustration.props.className || !illustration.props.className.includes('spectrum-IllustratedMessage-illustration'))) {
      illustration = React.cloneElement(illustration, {
        className: classNames(illustration.props.className, 'spectrum-IllustratedMessage-illustration'),
        'aria-hidden': this.isIllustrationDecorative() || null
      });
    }

    return (
      <div
        {...filterDOMProps(otherProps)}
        className={classNames('spectrum-IllustratedMessage', className)}>
        {illustration}
        {heading &&
          <Heading variant="pageTitle" className="spectrum-IllustratedMessage-heading" aria-level={ariaLevel}>{heading}</Heading>
        }
        {description &&
          <p className="spectrum-Body--secondary spectrum-IllustratedMessage-description">{description}</p>
        }
      </div>
    );
  }
}
