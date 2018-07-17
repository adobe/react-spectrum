import React, {Component} from 'react';

export default class MenuDivider extends Component {
  static displayName = 'MenuDivider';

  render() {
    return <hr className="spectrum-Menu-divider" role="separator" />;
  }
}
