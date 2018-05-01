import Avatar from '../src/Avatar';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Avatar', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'Disabled',
    () => (
      <Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" disabled />
    ),
    {inline: true}
  );
