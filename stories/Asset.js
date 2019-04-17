import {Asset} from '../src/Asset';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Asset', module)
  .add(
    'Image',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="image" src="http://opensource.adobe.com/spectrum-css/2.7.2/docs/img/example-ava.jpg" alt="Shantanu Narayen" />
      </div>
    )
  )
  .add(
    'File',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="file" />
      </div>
    )
  )
  .add(
    'Folder',
    () => (
      <div style={{'width': '208px', 'height': '208px'}}>
        <Asset type="folder" />
      </div>
    )
  )
  .add(
    'Decorative: true',
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
    {info: 'Use the decorative boolean prop to indicate that the image is decorative, or redundant with displayed text, and should not announced by screen readers.'}
  );
