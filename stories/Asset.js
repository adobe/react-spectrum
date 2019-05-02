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
        <Asset type="image" src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" alt="Shantanu Narayen" />
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
  )
  .addWithInfo(
    'Decorative: true',
    'Use the decorative boolean prop to indicate that the image is decorative, or redundant with displayed text, and should not announced by screen readers.',
    () => (
      <div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="image" src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" alt="Shantanu Narayen" decorative />
        </div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="file" decorative />
        </div>
        <div style={{width: '128px', height: '128px'}}>
          <Asset type="folder" decorative />
        </div>
      </div>
    ),
    {inline: true}
  );
