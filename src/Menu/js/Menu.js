import classNames from 'classnames';
import {List} from '../../List';
import React, {PropTypes} from 'react';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import '../style/index.styl';

export default class Menu extends React.Component {
  static propTypes = {
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSelect: PropTypes.func,
    className: PropTypes.string
  };

  render() {
    const {className, open, onClose, onSelect, placement, ...otherProps} = this.props;
    let placementClass = '';
    if (placement) {
      placementClass = `spectrum-Flyout--${placement.split(' ')[0]}`;
    }

    return (
      <RootCloseWrapper onRootClose={onClose}>
        <List role="menu" className={classNames('spectrum-Flyout', placementClass, {'is-open': open}, className)} {...otherProps}>
          {React.Children.map(this.props.children, child => React.cloneElement(child, {onSelect}))}
        </List>
      </RootCloseWrapper>
    );
  }
}
