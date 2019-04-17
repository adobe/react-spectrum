import Avatar from '../src/Avatar';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Avatar', module)
  .add(
    'Default',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" />
    )
  )
  .add(
    'Disabled',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" disabled />
    )
  )
  .add(
    'With alt text',
    () => (
      <Avatar src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" alt="Shantanu Narayen" />
    )
  );
