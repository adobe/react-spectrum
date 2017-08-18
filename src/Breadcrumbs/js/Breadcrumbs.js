import classNames from 'classnames';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

const ICON_SIZE = {
  S: 'S',
  M: 'S',
  L: 'M'
};

export default class Breadcrumbs extends React.Component {
  static defaultProps = {
    items: [],
    icon: null,
    disabled: false,
    size: 'S',
    onBreadcrumbClick: function () {}
  };

  render() {
    const {items, icon, disabled, onBreadcrumbClick, size} = this.props;

    return (
      <div className={classNames('coral-Breadcrumbs', 'coral-Breadcrumbs--' + size, {'is-disabled': disabled})}>
        {icon &&
          <Icon icon={icon} size={ICON_SIZE[size]} />
        }

        {items.map((item, i) =>
          (<span
            key={i}
            className="coral-Breadcrumb"
            onClick={!disabled && items.length > 1 && i < items.length - 1 && onBreadcrumbClick.bind(null, item, items.length - i - 1)}>
            {i > 0 &&
            <Icon icon="chevronRight" size="XS" />
              }
            {item.label}
          </span>)
        )}
      </div>
    );
  }
}
