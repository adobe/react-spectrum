import {Asset} from '../src/Asset';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Asset', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Image',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="image" src="http://spectrum-css.corp.adobe.com/2.0.0-beta.91/docs/img/example-ava.jpg" />
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'File',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="file" />
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Folder',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="folder" />
      </div>
    ),
    {inline: true}
  );
