/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

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

export default function OpenTransition(props) {
  return (
    <Transition timeout={{enter: 0, exit: 125}} {...props}>
      {(state) => React.cloneElement(props.children, {open: !!OPEN_STATES[state]})}
    </Transition>
  );
}
