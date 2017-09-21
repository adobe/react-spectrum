import classNames from 'classnames';
import {List} from '../../List';
import React from 'react';
import RootCloseWrapper from 'devongovett-react-overlays/lib/RootCloseWrapper';

import '../style/index.styl';

export default class Menu extends React.Component {
  render() {
    const {className, open, ...otherProps} = this.props;

    return (
      <RootCloseWrapper onRootClose={this.props.onClose}>
        <List role="menu" className={classNames('spectrum-Flyout', {'is-open': open}, className)} {...otherProps}>
          {React.Children.map(this.props.children, child => React.cloneElement(child, {onSelect: this.props.onSelect}))}
        </List>
      </RootCloseWrapper>
    );
  }
}
