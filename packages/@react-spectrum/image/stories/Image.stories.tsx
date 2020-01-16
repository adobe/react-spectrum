import {action} from '@storybook/addon-actions';
import {Image, ImageProps} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Image', module)
  .add(
    'name me',
    () => render({})
  );

function render(props:ImageProps = {}) {
  return (
    <Image {...props}>
    </Image>
  );
}
