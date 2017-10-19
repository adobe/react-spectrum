import classNames from 'classnames';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

export default class Breadcrumbs extends React.Component {
  static defaultProps = {
    items: [],
    icon: null,
    onBreadcrumbClick: function () {}
  };

  render() {
    const {items, icon, onBreadcrumbClick, className} = this.props;

    return (
      <div className={classNames('spectrum-Breadcrumbs', className)}>
        {icon &&
          <Icon icon={icon} size="S" />
        }

        {items.map((item, i) =>
          (<span
            key={i}
            className="spectrum-Breadcrumb"
            onClick={items.length > 1 && i < items.length - 1 && onBreadcrumbClick.bind(null, item, items.length - i - 1)}>
            {item.label}
          </span>)
        )}
      </div>
    );
  }
}
