/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {cloneElement, JSX, RefObject, useState} from 'react';
import {ColorThumb} from 'react-aria-components';
import {createPortal} from 'react-dom';
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useId, useLayoutEffect} from '@react-aria/utils';

const HANDLE_SIZE = 16;
const LOUPE_HEIGHT = 64; // Does not include borders
const LOUPE_WIDTH = 48;
const LOUPE_BORDER_WIDTH = 1;
const LOUPE_OFFSET = 12; // Offset from handle to loupe

interface ColorHandleProps {
  containerRef: RefObject<HTMLElement | null>,
  getPosition: () => {x: number, y: number}
}

export function ColorHandle({containerRef, getPosition}: ColorHandleProps) {
  return (
    <ColorThumb
      className={style({
        transition: '[width, height]',
        size: {
          default: HANDLE_SIZE,
          isFocusVisible: 32
        },
        backgroundColor: {
          isDisabled: 'disabled'
        },
        borderRadius: 'full',
        boxSizing: 'border-box',
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: {
          default: 'white',
          isDisabled: 'disabled'
        },
        outlineStyle: 'solid',
        outlineWidth: 1,
        outlineColor: {
          default: 'black/42',
          forcedColors: 'ButtonBorder'
        }
      })}
      style={({defaultStyle, isDisabled}) => ({
        background: isDisabled ? undefined : `linear-gradient(${defaultStyle.backgroundColor}, ${defaultStyle.backgroundColor}), repeating-conic-gradient(#E1E1E1 0% 25%, white 0% 50%) 50% / 16px 16px`,
        backgroundColor: undefined,
        top: defaultStyle.top || '50%',
        left: defaultStyle.left || '50%'
      })}>
      {({isDragging, color}) => (<>
        <div
          className={style({
            size: 'full',
            borderRadius: 'full',
            boxSizing: 'border-box',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: {
              default: 'black/42',
              forcedColors: 'ButtonBorder'
            }
          })} />
        <ColorLoupePortal isOpen={isDragging}>
          <ColorLoupe containerRef={containerRef} color={color} getPosition={getPosition} />
        </ColorLoupePortal>
      </>)}
    </ColorThumb>
  );
}

// ColorLoupe is rendered in a portal so that it breaks out of clipped/scrolling containers (e.g. popovers).
function ColorLoupePortal({isOpen, children}: { isOpen: boolean, children: JSX.Element }) {
  let [state, setState] = useState(isOpen ? 'open' : 'closed');
  if (isOpen && state === 'closed') {
    setState('open');
  }

  if (!isOpen && state === 'open') {
    setState('exiting');
  }

  if (isOpen || state === 'exiting') {
    return createPortal(cloneElement(children, {isExiting: state === 'exiting', onExited: () => setState('closed')}), document.body);
  }

  return null;
}

function ColorLoupe({isExiting, onExited, containerRef, loupeRef, getPosition, color}: any) {
  let patternId = useId();

  // Get the bounding rectangle of the container (e.g. ColorArea/ColorSlider).
  let [containerRect, setContainerRect] = useState({top: 0, left: 0, width: 0, height: 0});
  useLayoutEffect(() => {
    let rect = containerRef.current?.getBoundingClientRect();
    setContainerRect({
      top: rect?.top || 0,
      left: rect?.left || 0,
      width: rect?.width || 0,
      height: rect?.height || 0
    });
  }, [containerRef]);

  // Compute the pixel position of the thumb.
  let {x: thumbLeft, y: thumbTop} = getPosition();
  thumbTop *= containerRect.height;
  thumbLeft *= containerRect.width;

  let enterAnimation = keyframes(`
    from {
      transform: translateY(8px);
      opacity: 0;
    }
  `);

  let exitAnimation = keyframes(`
    to {
      transform: translateY(8px);
      opacity: 0;
    }
  `);

  return (
    <svg
      style={{
        // Position relative to the viewport.
        position: 'fixed',
        top: containerRect.top + thumbTop,
        left: containerRect.left + thumbLeft,
        marginTop: -LOUPE_HEIGHT - LOUPE_BORDER_WIDTH * 2 - HANDLE_SIZE / 2 - LOUPE_OFFSET,
        marginLeft: -LOUPE_WIDTH / 2 - LOUPE_BORDER_WIDTH,
        animationName: isExiting ? exitAnimation : enterAnimation
      }}
      className={style({
        filter: 'elevated',
        pointerEvents: 'none',
        animationDuration: 125,
        animationFillMode: 'forwards',
        animationTimingFunction: 'in-out',
        isolation: 'isolate'
      })}
      onAnimationEnd={e => {
        if (e.animationName === exitAnimation) {
          onExited();
        }
      }}
      width={LOUPE_WIDTH + LOUPE_BORDER_WIDTH * 2}
      height={LOUPE_HEIGHT + LOUPE_BORDER_WIDTH * 2}
      ref={loupeRef}
      aria-hidden="true">
      <pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect fill="white" x="0" y="0" width="16" height="16" />
        <rect fill="#E1E1E1" x="0" y="0" width="8" height="8" />
        <rect fill="#E1E1E1" x="8" y="8" width="8" height="8" />
      </pattern>
      <path
        d="M25 1a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
        fill={`url(#${patternId})`} />
      <path
        d="M25 1a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z"
        fill={color.toString()} />
      <path
        className={style({
          strokeWidth: 1,
          stroke: {
            default: 'transparent-black-200',
            forcedColors: 'ButtonBorder'
          },
          fill: 'white'
        })}
        d="M25 3A21.98 21.98 0 003 25c0 6.2 4 14.794 11.568 24.853A144.233 144.233 0 0025 62.132a144.085 144.085 0 0010.4-12.239C42.99 39.816 47 31.209 47 25A21.98 21.98 0 0025 3m0-2a24 24 0 0124 24c0 16.255-24 40-24 40S1 41.255 1 25A24 24 0 0125 1z" />
    </svg>
  );
}
