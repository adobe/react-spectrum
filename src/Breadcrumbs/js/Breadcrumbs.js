import ChevronRightSmall from '../../Icon/core/ChevronRightSmall';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('breadcrumb');

export default class Breadcrumbs extends React.Component {
  static variant = {
    NONE: 'none',
    TITLE: 'title'
  }

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({href: PropTypes.string, label: PropTypes.string})),

    /**
     * For best results, use a React Spectrum Icon
     */
    icon: PropTypes.node,

    /**
     * Will set the last breadcrumb on a new line and give it a <h> tag
     */
    variant: PropTypes.oneOf([Breadcrumbs.variant.NONE, Breadcrumbs.variant.TITLE]),

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
    const {items, icon, onBreadcrumbClick, className, variant, ariaLevel} = this.props;
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

    return (
      <nav>
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
