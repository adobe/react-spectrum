import PortalContainer from '@react/react-spectrum/PortalContainer';
import React from 'react';

export class ModalCleanup extends React.Component {
  componentWillUnmount() {
    PortalContainer.removeAll();
  }
  render() {
    return this.props.children;
  }
}
