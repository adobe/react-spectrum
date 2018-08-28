import React, {Component} from 'react';

export default class MenuDivider extends Component {
  static displayName = 'MenuDivider';

  render() {
    return <li className="spectrum-Menu-divider" role="separator" />;
  }
}
