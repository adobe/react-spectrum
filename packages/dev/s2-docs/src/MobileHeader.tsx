'use client';

import {ActionButton, MenuTrigger} from '@react-spectrum/s2';
import {AdobeLogo} from './AdobeLogo';
import {CSSProperties, useEffect, useRef} from 'react';
import {keyframes} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

let fadeOut = keyframes(`
  0% {
    opacity: 1;
    transform: translateY(0px);
  }

  100% {
    opacity: 0;
    transform: translateY(calc(-100% - 12px));
  }
`);

let shadow = keyframes(`
  0% {
    box-shadow: none;
    background-color: var(--base-bg);
  }

  100% {
    box-shadow: var(--shadow);
    background-color: var(--layer-2-bg);
  }
`);

let fadeIn = keyframes(`
  0% {
    opacity: 0;
    transform: translateY(calc(100% + 12px));
  }

  100% {
    opacity: 1;
    transform: translateY(0px);
  }
`);

const animation = {
  animationDuration: '1s',
  animationPlayState: {
    default: 'paused',
    '@supports (animation-timeline: scroll())': 'running'
  },
  animationFillMode: 'both',
  transitionTimingFunction: 'linear'
} as const;

const animationRange = '24px 64px';

export function MobileHeader({toc, nav}) {
  let ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Tiny polyfill for scroll driven animations.
    // Element must have animationDuration: 1s and animationPlayState: paused.
    if (!CSS.supports('(animation-timeline: scroll())') && ref.current) {
      let [start, end] = animationRange.split(' ').map(v => parseInt(v, 10));
      let animations = ref.current.getAnimations({subtree: true});
      let onScroll = () => {
        // Calculate animation time based on percentage of animationRange * duration.
        let time = Math.max(0, Math.min(end, (window.scrollY - start)) / (end - start)) * 1000;
        for (let animation of animations) {
          animation.currentTime = time;
        }
      };

      window.addEventListener('scroll', onScroll, {passive: true});
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  return (
    <div
      ref={ref}
      className={style({
        position: 'sticky',
        top: 0,
        width: 'full',
        padding: 12,
        boxSizing: 'border-box',
        display: {
          default: 'flex',
          lg: 'none'
        },
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
        overflow: 'clip',
        '--base-bg': {
          type: 'backgroundColor',
          value: 'base'
        },
        '--layer-2-bg': {
          type: 'backgroundColor',
          value: 'layer-2'
        },
        '--shadow': {
          type: 'boxShadow',
          value: 'elevated'
        },
        ...animation
      })}
      style={{
        animationName: shadow,
        animationTimeline: 'scroll()',
        animationRange
      } as CSSProperties}>
      <div
        className={style({
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexGrow: 1
        })}>
        <AdobeLogo />
        <h2 
          className={style({
            font: 'heading-sm',
            marginY: 0,
            ...animation
          })}
          style={{
            animationName: fadeOut,
            animationTimeline: 'scroll()',
            animationRange
          } as CSSProperties}>
          React Aria
        </h2>
      </div>
      <div
        className={style({
          ...animation,
          position: 'absolute',
          left: '50%',
          translateX: '-50%'
        })}
        style={{
          animationName: fadeIn,
          animationTimeline: 'scroll()',
          animationRange
        } as CSSProperties}>
        {toc}
      </div>
      <MenuTrigger align="end">
        <ActionButton aria-label="Navigation" isQuiet>
          <MenuHamburger />
        </ActionButton>
        {nav}
      </MenuTrigger>
    </div>
  );
}
