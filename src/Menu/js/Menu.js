import classNames from 'classnames';
import {List} from '../../List';
import React from 'react';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

import '../style/index.styl';

export default class Menu extends React.Component {
  render() {
    const {className} = this.props;

    return (
      <RootCloseWrapper onRootClose={this.props.onClose}>
        <List role="menu" className={classNames('coral-Menu', className)}>
          {React.Children.map(this.props.children, child => React.cloneElement(child, {onSelect: this.props.onSelect}))}
        </List>
      </RootCloseWrapper>
    );
  }
}
