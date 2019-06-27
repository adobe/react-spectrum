import React from 'react';
import StatusLight from '@react/react-spectrum/StatusLight';
import Switch from '@react/react-spectrum/Switch';
import '@react/react-spectrum/utils/style/index.css';

export default class StatusLightExample extends React.Component {
  state = {
    on: false
  };
  render() {
    const {
      on
    } = this.state;
    return (<div>
      <StatusLight role="status" variant={on ? 'positive' : 'notice'}>
        <span className="u-react-spectrum-screenReaderOnly">Pull Request </span>
        {on ? 'Approved' : 'Needs Approval'}
      </StatusLight>
      <Switch label="Toggle Status" onChange={(checked => this.setState({on: checked})).bind(this)} />
    </div>);
  }
}
