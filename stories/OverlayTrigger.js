import React from 'react';
import {storiesOf} from '@kadira/storybook';
import Popover from '../src/Popover';

import OverlayTrigger from '../src/OverlayTrigger';

storiesOf('OverlayTrigger', module)
  .addWithInfo(
    'default',
    `
    blah.
    `,
    () => render(),
    {inline: true}
  );

const render = (props = {overlay: <Popover />}) => (
  <OverlayTrigger overlay={<Popover title="Title"><span>This is the content</span></Popover>}><button type="button" style={{width: '100px', display: 'block'}}>Click Me</button></OverlayTrigger>
);
