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
  <OverlayTrigger><button>Click me</button><Popover title="popover">my content</Popover></OverlayTrigger>
);
