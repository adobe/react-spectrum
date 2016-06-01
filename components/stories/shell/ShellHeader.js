import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import ShellHeader from '../../shell/ShellHeader';
import ShellWorkspaces from '../../shell/ShellWorkspaces';
import ShellWorkspace from '../../shell/ShellWorkspace';
import ShellActions from '../../shell/ShellActions';
import Button from '../../Button';

storiesOf('ShellHeader', module)
  .addDecorator(story => <div style={{ textAlign: 'left' }}>{ story() }</div>)
  .add('Default', () => render())
  .add('homeIcon: adobeAnalyticsColor', () => render({ homeIcon: 'adobeAnalyticsColor' }))

function render(props = {}) {
  return (
    <ShellHeader { ...props }>
      <div className="coral-Shell-header-actions" />
      <ShellActions>
        <Button element="a" href="#" variant="quiet">Beta Feedback</Button>
        <Button variant="minimal" className="coral-Shell-menu-button">NIKE, Inc</Button>
        <Button variant="minimal" className="coral-Shell-menu-button" icon="helpCircle" square />
        <Button variant="minimal" className="coral-Shell-menu-button" icon="bell" square />
        <Button variant="minimal" className="coral-Shell-menu-button" icon="apps" square />
        <Button variant="minimal" className="coral-Shell-menu-button" icon="userCircleColor" square />
      </ShellActions>
      <ShellWorkspaces>
        <ShellWorkspace href="#workspace1" selected>Workspace 1</ShellWorkspace>
        <ShellWorkspace href="#workspace2">Workspace 2</ShellWorkspace>
        <ShellWorkspace href="#workspace3">Workspace 3</ShellWorkspace>
      </ShellWorkspaces>
    </ShellHeader>
  );
}
