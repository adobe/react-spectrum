import BreadcrumbChevron from '../../Icon/core/BreadcrumbChevron';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import React from 'react';
import '../style/index.styl';

export default class Breadcrumbs extends React.Component {
  static variant = {
    NONE: 'none',
    TITLE: 'title'
  }

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

    const getLinkMarkup = (item, i) => (
      <a
        className="spectrum-Breadcrumb-link"
        role={!item.href ? 'link' : null}
        href={!isCurrent(i) ? item.href : null}
        target={!isCurrent(i) && item.href ? '_self' : null}
        onClick={items.length > 1 && !isCurrent(i) ? onBreadcrumbClick.bind(null, item, items.length - i - 1) : undefined}
        onFocus={items.length > 1 && !isCurrent(i) ? this.handleFocus.bind(this) : null}
        onBlur={items.length > 1 && !isCurrent(i) ? this.handleBlur.bind(this) : null}
        aria-current={isCurrent(i) ? 'page' : null}
        tabIndex={!item.href && !isCurrent(i) ? 0 : null}>
        {item.label}
      </a>
    );

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
            <li key={`spectrum-Breadcrumb-${i}`} className="spectrum-Breadcrumb">
              {
                isCurrent(i) && isTitleVariant ?
                  <h1 className="spectrum-Heading--pageTitle" aria-level={ariaLevel}>
                    {getLinkMarkup(item, i)}
                  </h1>
                  : getLinkMarkup(item, i)
              }
              {!isCurrent(i) &&
                <BreadcrumbChevron size={null} className="spectrum-Breadcrumb-separator" />
              }
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
