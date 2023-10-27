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
import React, {useEffect, useRef} from 'react';
import {useInteractOutside, usePress} from '../';

export default {
  title: 'useInteractOutside'
};

export const OutsideBody = () => <Demo />;
OutsideBody.decorators = [(Story) => <BodyStyler><Story /></BodyStyler>];

export const ClickingButtonShouldFireOnInteractOutside = () => <App />;

function Demo() {
  let ref = useRef(null);
  let onInteractOutside = action('outside');
  useInteractOutside({ref, onInteractOutside});
  return <div ref={ref} style={{marginInlineStart: '50px', marginBlockStart: '50px'}}>Click anywhere but this text</div>;
}

function BodyStyler(props) {
  useEffect(() => {
    let story: HTMLElement = document.querySelector('.react-spectrum-story')!;
    let prev = {body: {height: document.body.style.height, width: document.body.style.width}, story: {minHeight: story.style.minHeight}};
    document.body.style.height = 'fit-content';
    document.body.style.width = 'fit-content';
    story.style.minHeight = 'initial';
    return () => {
      document.body.style.height = prev.body.height;
      document.body.style.width = prev.body.width;
      story.style.minHeight = prev.story.minHeight;
    };
  });
  return props.children;
}


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
    onInteractOutside: action('clicked outside of orange div'),
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
