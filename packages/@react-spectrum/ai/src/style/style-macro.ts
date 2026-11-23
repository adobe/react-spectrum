/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {MacroContext} from '@parcel/macros';

export interface ScrollFadeOptions {
  top?: number;
  bottom?: number;
  start?: number;
  end?: number;
  x?: number;
  y?: number;
  inset?: number;
}

function generateName(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return `ai-${hash.toString(36)}`;
}

export function keyframes(this: MacroContext | void, value: string): string {
  let name = generateName(value);
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `@keyframes ${name} {\n  ${value}\n}`
    });
  }
  return name;
}

function css(this: MacroContext | void, content: string): string {
  let className = generateName(content);
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `@layer _.a {\n  .${className} {\n    ${content}\n  }\n}`
    });
  }
  return className;
}

/**
 * Generates a mask that fades the edges of an AI scroll container where more content is available.
 * Must be imported with `{type: 'macro'}`.
 */
export function scrollFade(this: MacroContext | void, options: ScrollFadeOptions): string {
  let {x = 0, y = 0, top = y, bottom = y, start = x, end = x, inset = 0} = options;

  let blockMask = '',
    inlineMask = '';

  if (top || bottom) {
    blockMask = `linear-gradient(
      to bottom,
      transparent 0px ${inset > 0 ? `calc(var(--scroll-fade-top, ${inset}px) - ${top}px)` : ''},
      black var(--scroll-fade-top, ${inset}px),
      black var(--scroll-fade-bottom, calc(100% - ${bottom}px)),
      transparent ${inset > 0 ? `calc(var(--scroll-fade-bottom, 100%) + ${inset}px)` : ''} 100%
    )`;
  }

  if (start || end) {
    inlineMask = `linear-gradient(
      to right,
      transparent 0px calc(var(--scroll-fade-left, var(--scroll-fade-left-edge)) - var(--scroll-fade-left-size)),
      black var(--scroll-fade-left, var(--scroll-fade-left-edge)),
      black var(--scroll-fade-right, calc(100% - var(--scroll-fade-right-edge))),
      transparent calc(var(--scroll-fade-right, calc(100% - var(--scroll-fade-right-edge))) + var(--scroll-fade-right-size)) 100%
    )`;
  }

  let topAnimation = scrollFadeKeyframes.call(
    this,
    'top',
    '0px',
    top ? `${top + inset}px` : '',
    '0px'
  );
  let bottomAnimation = scrollFadeKeyframes.call(
    this,
    'bottom',
    bottom ? `calc(100% - ${bottom + inset}px)` : '',
    '100%',
    '100%'
  );
  let leftAnimation = scrollFadeKeyframes.call(
    this,
    'left',
    '0px',
    start || end ? 'var(--scroll-fade-left-edge)' : '',
    '0px'
  );
  let rightAnimation = scrollFadeKeyframes.call(
    this,
    'right',
    start || end ? 'calc(100% - var(--scroll-fade-right-edge))' : '',
    '100%',
    '100%'
  );
  let animations = [
    {name: topAnimation, timeline: 'scroll(self y)', range: `0px ${top}px`, rtlDirection: 'normal'},
    {
      name: bottomAnimation,
      timeline: 'scroll(self y)',
      range: `calc(100% - ${bottom}px) 100%`,
      rtlDirection: 'normal'
    },
    {
      name: leftAnimation,
      timeline: 'scroll(self x)',
      range: '0px var(--scroll-fade-left-size)',
      rtlDirection: 'reverse'
    },
    {
      name: rightAnimation,
      timeline: 'scroll(self x)',
      range: 'calc(100% - var(--scroll-fade-right-size)) 100%',
      rtlDirection: 'reverse'
    }
  ].filter(animation => animation.name);
  let timeline = animations.map(animation => animation.timeline).join(', ');
  let range = animations.map(animation => animation.range).join(', ');

  if (blockMask || inlineMask) {
    let inlineVariables =
      start || end
        ? `
      --scroll-fade-left-size: ${start}px;
      --scroll-fade-right-size: ${end}px;
      --scroll-fade-left-edge: ${start + inset}px;
      --scroll-fade-right-edge: ${end + inset}px;

      &:dir(rtl) {
        --scroll-fade-left-size: ${end}px;
        --scroll-fade-right-size: ${start}px;
        --scroll-fade-left-edge: ${end + inset}px;
        --scroll-fade-right-edge: ${start + inset}px;
      }
    `
        : '';

    let animationDirection = animations.map(() => 'normal').join(', ');
    let rtlAnimationDirection = animations.map(animation => animation.rtlDirection).join(', ');

    return css.call(
      this,
      `
      ${inlineVariables}
      mask-image: ${[blockMask, inlineMask].filter(Boolean).join(', ')};
      mask-composite: intersect;
      mask-repeat: no-repeat;

      @supports (animation-timeline: scroll()) {
        animation: ${animations.map(animation => animation.name).join(', ')};
        animation-duration: 1ms;
        animation-timing-function: ease-in-out;
        animation-timeline: ${timeline};
        animation-range: ${range};
        animation-fill-mode: both;
        animation-direction: ${animationDirection};

        &:dir(rtl) {
          animation-direction: ${rtlAnimationDirection};
        }
      }
    `
    );
  }

  return '';
}

function scrollFadeKeyframes(
  this: MacroContext | void,
  name: string,
  start: string,
  end: string,
  initial: string
) {
  if (!start || !end) {
    return '';
  }

  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `
    @property --scroll-fade-${name} {
      syntax: "<length-percentage>";
      inherits: false;
      initial-value: ${initial};
    }
  `
    });
  }

  return keyframes.call(
    this,
    `
      from { --scroll-fade-${name}: ${start}; }
      to { --scroll-fade-${name}: ${end}; }
    `
  );
}
