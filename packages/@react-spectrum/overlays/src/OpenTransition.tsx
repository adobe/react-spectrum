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
import Transition from 'react-transition-group/Transition';

const OPEN_STATES = {
  entering: false,
  entered: true
};

/**
 * timeout issues adding css animations to enter may be related to
 * https://github.com/reactjs/react-transition-group/issues/189 or
 * https://github.com/reactjs/react-transition-group/issues/22
 * my VM isn't good enough to debug accurately and get a better answer
 *
 * as a result, use enter 0 so that is-open is applied once entered
 * it doesn't matter if we know when the css-animation is done on entering
 * for exiting though, give time for the css-animation to play
 * before removing from the DOM
 * **note** hitting esc bypasses exit animation for anyone testing
 */

export function OpenTransition(props) {
  return (
    <Transition timeout={{enter: 0, exit: 350}} {...props}>
      {(state) => React.Children.map(props.children, child => React.cloneElement(child, {isOpen: !!OPEN_STATES[state]}))}
    </Transition>
  );
}
