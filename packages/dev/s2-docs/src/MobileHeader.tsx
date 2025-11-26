'use client';

import {ActionButton, DialogTrigger, pressScale} from '@react-spectrum/s2';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getBaseUrl} from './pageUtils';
import {getLibraryFromPage} from './library';
import {keyframes} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import {Link} from 'react-aria-components';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import {Modal} from '../../../@react-spectrum/s2/src/Modal';
import React, {CSSProperties, lazy, useEffect, useRef} from 'react';
import {TAB_DEFS} from './constants';

const MobileSearchMenu = lazy(() => import('./SearchMenu').then(({MobileSearchMenu}) => ({default: MobileSearchMenu})));

let fadeOut = keyframes(`
  0% {
    opacity: 1;
    transform: translateY(0px);
  }

  100% {
    opacity: 0;
    transform: translateY(calc(-100% - 12px));
    width: 0px;
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

export function MobileHeader({toc, pages, currentPage}) {
  let ref = useRef<HTMLDivElement | null>(null);
  let linkRef = useRef<HTMLAnchorElement | null>(null);

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

  let library = getLibraryFromPage(currentPage);
  let icon = TAB_DEFS[library].icon;
  let subdirectory: 's2' | 'react-aria' = 's2';
  if (library === 'internationalized' || library === 'react-aria') {
    // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
    subdirectory = 'react-aria';
  }

  let homepage = getBaseUrl(subdirectory);

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
        zIndex: 1,
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
      <div className={style({flexGrow: 1})}>
        <Link
          href={homepage}
          ref={linkRef}
          style={pressScale(linkRef)}
          className={style({
            ...focusRing(),
            display: 'flex',
            alignItems: 'center',
            width: 'fit',
            gap: 12,
            borderRadius: 'default',
            textDecoration: 'none',
            transition: 'default',
            disableTapHighlight: true
          })}>
          {icon}
          <span
            className={style({
              font: 'heading-sm',
              whiteSpace: 'nowrap',
              ...animation
            })}
            style={toc ? {
              animationName: fadeOut,
              animationTimeline: 'scroll()',
              animationRange
            } as CSSProperties : undefined}>
            {TAB_DEFS[library].label}
          </span>
        </Link>
      </div>
      {toc && (
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
      )}
      <DialogTrigger>
        <ActionButton aria-label="Navigation" isQuiet>
          <MenuHamburger />
        </ActionButton>
        <Modal size="fullscreenTakeover">
          <MobileSearchMenu pages={pages} currentPage={currentPage} />
        </Modal>
      </DialogTrigger>
    </div>
  );
}
