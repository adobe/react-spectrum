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

/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import {action} from '@storybook/addon-actions';
import {clamp} from '@react-aria/utils';
import {Flex} from '@react-spectrum/layout';
import React, {useRef, useState} from 'react';
import {useMove} from '../';

interface IPosition {
  x: number,
  y: number
}

interface ClampedMoveProps {
  getCurrentState: () => IPosition,
  onMoveTo: (e: any) => void,
  onMoveStart?: (e: any) => void,
  onMoveEnd?: (e: any) => void,
  reverseX?: boolean,
  reverseY?: boolean
}

function useClampedMove(props: ClampedMoveProps) {
  let currentPosition = useRef<IPosition | null>(undefined);

  let {getCurrentState, onMoveTo, onMoveStart, onMoveEnd, reverseX = false, reverseY = false} = props;

  let {moveProps} = useMove({
    onMoveStart(e) {
      currentPosition.current = null;
      onMoveStart?.(e);
    },
    onMove({deltaX, deltaY, pointerType}) {
      if (!currentPosition.current) {
        currentPosition.current = getCurrentState();
      }

      currentPosition.current.x += reverseX ? -deltaX : deltaX;
      currentPosition.current.y += reverseY ? -deltaY : deltaY;
      onMoveTo({pointerType, x: currentPosition.current.x, y: currentPosition.current.y});
    },
    onMoveEnd
  });

  return moveProps;
}

function Ball1D() {
  let [state, setState] = useState({x: 0, color: 'black'});

  let props = useClampedMove({
    reverseY: true,
    onMoveStart() { setState((state) => ({...state, color: 'red'})); },
    onMoveTo({x}) {
      setState((state) => ({...state, x: clamp(x, 0, 200 - 30), y: 0}));
    },
    getCurrentState() { return {x: state.x, y: 0}; },
    onMoveEnd() { setState((state) => ({...state, color: 'black'})); }
  });

  return (<div style={{width: '200px', height: '30px', background: 'white', border: '1px solid black', position: 'relative', touchAction: 'none'}}>
    <div tabIndex={0} {...props} style={{width: '30px', height: '30px', borderRadius: '100%', position: 'absolute', left: state.x + 'px', background: state.color}} />
  </div>);
}

export default {
  title: 'useMove'
};

export const Log = () => {
  let {moveProps} = useMove({
    onMoveStart(e) { action('onMoveStart')(JSON.stringify(e)); },
    onMove(e) { action('onMove')(JSON.stringify(e)); },
    onMoveEnd(e) { action('onMoveEnd')(JSON.stringify(e)); }
  });

  return <div {...moveProps} style={{width: '200px', height: '200px', background: 'white', border: '1px solid black', touchAction: 'none'}} />;
};

export const _Ball1D = {
  render: () => (
    <Flex direction="column" gap="size-1000">
      <Ball1D />
      <Ball1D />
    </Flex>
  ),
  name: 'Ball 1D'
};

function Ball2DStory() {
  let [state, setState] = useState({x: 0, y: 0, color: 'black'});

  let props = useClampedMove({
    onMoveStart() { setState((state) => ({...state, color: 'red'})); },
    onMoveTo({x, y}) {
      setState((state) => ({...state, x: clamp(x, 0, 200 - 30), y: clamp(y, 0, 200 - 30)}));
    },
    getCurrentState() { return {x: state.x, y: state.y}; },
    onMoveEnd() { setState((state) => ({...state, color: 'black'})); }
  });

  return (
    <div style={{width: '200px', height: '200px', background: 'white', border: '1px solid black', position: 'relative', touchAction: 'none'}}>
      <div tabIndex={0} {...props} style={{width: '30px', height: '30px', borderRadius: '100%', position: 'absolute', left: state.x + 'px', top: state.y + 'px', background: state.color}} />
    </div>
  );
}

export const Ball2D = {
  render: () => <Ball2DStory />,
  name: 'Ball 2D'
};

function BallNestedStory() {
  let [ballState, setBallState] = useState({x: 0, y: 0, color: 'black'});
  let [boxState, setBoxState] = useState({x: 100, y: 100, color: 'grey'});

  let {moveProps: ballProps} = useMove({
    onMoveStart() { setBallState((state) => ({...state, color: 'red'})); },
    onMove(e) { setBallState((state) => ({...state, x: state.x + e.deltaX, y: state.y + e.deltaY})); },
    onMoveEnd() { setBallState((state) => ({...state, color: 'black'})); }
  });
  let {moveProps: boxProps} = useMove({
    onMoveStart() { setBoxState((state) => ({...state, color: 'orange'})); },
    onMove(e) { setBoxState((state) => ({...state, x: state.x + e.deltaX, y: state.y + e.deltaY})); },
    onMoveEnd() { setBoxState((state) => ({...state, color: 'grey'})); }
  });

  return (
    <div tabIndex={0} {...boxProps} style={{width: '100px', height: '100px', touchAction: 'none', position: 'absolute', left: boxState.x + 'px', top: boxState.y + 'px', background: boxState.color}}>
      <div tabIndex={0} {...ballProps} style={{width: '30px', height: '30px', borderRadius: '100%', position: 'absolute', left: ballState.x + 'px', top: ballState.y + 'px', background: ballState.color}} />
    </div>
  );
}

export const BallNested = {
  render: () => <BallNestedStory />,
  name: 'Ball nested'
};
