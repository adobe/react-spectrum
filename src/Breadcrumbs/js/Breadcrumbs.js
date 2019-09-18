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

import ChevronRightSmall from '../../Icon/core/ChevronRightSmall';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('breadcrumb');

const formatMessage = messageFormatter(intlMessages);

export default class Breadcrumbs extends React.Component {
  static variant = {
    NONE: 'none',
    TITLE: 'title'
  }

  static propTypes = {
    /**
     * Array of item objects included in list of breadcrumbs.
     * Each item must have a label string property, which will serve as the rendered text for the breadcrumb.
     * Each item may also have an href string property, which should be a valid URL to open the breadcrumb location.
     */
    items: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          href: PropTypes.string,
          label: PropTypes.string.isRequired
        }),
        PropTypes.shape({
          label: PropTypes.string.isRequired
        })
      ])
    ),

    /**
     * For best results, use a React Spectrum Icon
     */
    icon: PropTypes.node,

    /**
     * Will set the last breadcrumb on a new line and give it a <h> tag
     */
    variant: PropTypes.oneOf([
      Breadcrumbs.variant.NONE,
      Breadcrumbs.variant.TITLE
    ]),

    /**
     * Will not change the appearance
     */
    ariaLevel: PropTypes.number,

    /**
     * Called when a breadcrumb is clicked with an object containing the label of the clicked breadcrumb
     * @callback Breadcrumbs~onBreadcrumbClick
     * @param {Object} event - Event object
     * @param {string} event.label - label of breadcrumb clicked
     */
    onBreadcrumbClick: PropTypes.func
  };

  static defaultProps = {
    items: [],
    icon: null,
    variant: Breadcrumbs.variant.NONE,
    ariaLevel: null,
    onBreadcrumbClick: function () {}
  };

  handleFocus(e) {
    e.target.classList.add('focus-ring');
  }

  handleBlur(e) {
    e.target.classList.remove('focus-ring');
  }

  render() {
    const {
      items,
      icon,
      onBreadcrumbClick,
      className,
      variant,
      ariaLevel,
      id,
      ...otherProps
    } = this.props;
    const isTitleVariant = variant === Breadcrumbs.variant.TITLE;
    const isCurrent = (i) => i === items.length - 1;

    const getLinkMarkup = (item, i) => {
      let Element = !item.href ? 'div' : 'a';
      return (
        <Element
          className="spectrum-Breadcrumbs-itemLink"
          role={!item.href ? 'link' : null}
          href={!isCurrent(i) ? item.href : null}
          target={!isCurrent(i) && item.href ? '_self' : null}
          onClick={items.length > 1 && !isCurrent(i) ? onBreadcrumbClick.bind(null, item, items.length - i - 1) : undefined}
          onFocus={items.length > 1 && !isCurrent(i) ? this.handleFocus.bind(this) : null}
          onBlur={items.length > 1 && !isCurrent(i) ? this.handleBlur.bind(this) : null}
          aria-current={isCurrent(i) ? 'page' : null}
          tabIndex={!item.href && !isCurrent(i) ? 0 : null}>
          {item.label}
        </Element>
      );
    };

    if (!otherProps['aria-label']) {
      otherProps['aria-label'] = formatMessage('Breadcrumbs');
    }

    return (
      <nav
        id={id}
        aria-label={otherProps['aria-label']}
        aria-labelledby={otherProps['aria-labelledby']}>
        {cloneIcon(icon, {size: 'S', className: 'react-spectrum-Breadcrumbs-icon'})}
        <ul
          className={classNames(
            'spectrum-Breadcrumbs',
            {
              'spectrum-Breadcrumbs--title': isTitleVariant
            },
            className
          )}>
          {items.map((item, i) => (
            <li key={`spectrum-Breadcrumb-${i}`} className="spectrum-Breadcrumbs-item">
              {
                isCurrent(i) && isTitleVariant ?
                  <h1 className="spectrum-Heading--pageTitle" aria-level={ariaLevel}>
                    {getLinkMarkup(item, i)}
                  </h1>
                  : getLinkMarkup(item, i)
              }
              {!isCurrent(i) &&
                <ChevronRightSmall size={null} className="spectrum-Breadcrumbs-itemSeparator" />
              }
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
