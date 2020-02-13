/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {action} from '@storybook/addon-actions';
import {Link} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Link', module)
  .addParameters({providerSwitcher: {status: 'notice'}})
  .add(
    'Default',
    () => render({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})}
      </div>
    )
  )
  .add(
    'isQuiet: true',
    () => render({isQuiet: true, onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'isQuiet: true, variant: secondary',
    () => render({isQuiet: true, variant: 'secondary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'children: a',
    () => renderWithChildren({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'onPress',
    () => render({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'onClick',
    () => render({onClick: action('deprecatedOnClick'), onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  );

function render(props = {}) {
  return (
    <Link {...props}>
      This is a React Spectrum Link
    </Link>
  );
}

function renderWithChildren(props = {}) {
  return (
    <Link {...props}>
      <a href="//example.com" target="_self">This is a React Spectrum Link</a>
    </Link>
  );
}
