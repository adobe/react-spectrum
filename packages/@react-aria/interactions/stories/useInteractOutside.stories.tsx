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

import React from 'react';
import {storiesOf} from '@storybook/react';
import {useInteractOutside, usePress} from '../';

storiesOf('useInteractOutside', module)
  .add('basic',
    () => <App />
  );


function MyButton() {
  let ref = React.useRef(null);
  let {pressProps} = usePress({ref});

  return (
    <button {...pressProps} ref={ref}>
      My Button
    </button>
  );
}

function App() {
  let ref = React.useRef(null);

  useInteractOutside({
    // Clicking on "My Button" should fire this callback
    onInteractOutside: () => console.log('clicked outside of orange div'),
    ref
  });

  return (
    <div className="App">
      <div>Clicking 'My Button' should fire onInteractOutside</div>
      <div
        ref={ref}
        style={{
          width: '100px',
          height: '100px',
          background: 'orange'
        }} />
      <MyButton />
    </div>
  );
}
