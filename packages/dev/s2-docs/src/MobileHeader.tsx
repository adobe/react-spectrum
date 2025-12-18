'use client';

import {ActionButton, DialogTrigger, pressScale} from '@react-spectrum/s2';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getBaseUrl} from './pageUtils';
import {getLibraryFromPage, getLibraryIcon} from './library';
import {keyframes} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import {Link, Modal, ModalOverlay} from 'react-aria-components';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import React, {CSSProperties, lazy, useEffect, useRef, useState} from 'react';
import {TAB_DEFS} from './constants';
import {useLayoutEffect} from '@react-aria/utils';
import {useRouter} from './Router';
import './SearchMenu.css';

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

export function MobileHeader({toc}) {
  let ref = useRef<HTMLDivElement | null>(null);
  let linkRef = useRef<HTMLAnchorElement | null>(null);
  let labelRef = useRef<HTMLSpanElement | null>(null);

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

  let {currentPage} = useRouter();
  let library = getLibraryFromPage(currentPage);
  let icon = getLibraryIcon(library);
  let subdirectory: 's2' | 'react-aria' = 's2';
  if (library === 'react-aria') {
    // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
    subdirectory = 'react-aria';
  }

  let baseUrl = getBaseUrl(subdirectory);
  let homepage = `${baseUrl}/`;

  let [isOpen, setOpen] = useState(false);
  let [wasOpen, setWasOpen] = useState(isOpen);
  let [isTransitioning, setTransitioning] = useState(false);
  let renderCallback = useRef<(() => void) | null>(null);
  let onOpenChange = (isOpen: boolean) => {
    if (!document.startViewTransition) {
      setOpen(false);
      if (isOpen) {
        setWasOpen(true);
      }
      return;
    }

    // Don't transition the entire page.
    document.documentElement.style.viewTransitionName = 'none';

    // Only transition label if it is visible (scrolled to the top of the page).
    if (window.scrollY === 0 && labelRef.current && isOpen) {
      labelRef.current.style.viewTransitionName = 'search-menu-label';
    }

    let viewTransition = document.startViewTransition(() => {
      if (labelRef.current && window.scrollY === 0) {
        labelRef.current.style.viewTransitionName = !isOpen ? 'search-menu-label' : '';
      }

      // Wait until next render. Using flushSync causes flickering.
      return new Promise<void>(resolve => {
        renderCallback.current = resolve;
        setOpen(isOpen);
        setTransitioning(true);
        if (isOpen) {
          setWasOpen(true);
        }
      });
    });

    viewTransition.finished.then(() => {
      document.documentElement.style.viewTransitionName = '';
      labelRef.current!.style.viewTransitionName = '';
      setTransitioning(false);
    });
  };

  useLayoutEffect(() => {
    renderCallback.current?.();
    renderCallback.current = null;
  });

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
        animationRange,
        // Pause scroll animation during view transition to avoid flicker in Safari.
        animationPlayState: isTransitioning ? 'paused' : undefined
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
          <span style={{viewTransitionName: 'search-menu-icon', display: isOpen ? 'none' : undefined} as CSSProperties}>
            {icon}
          </span>
          <span
            ref={labelRef}
            className={style({
              font: 'heading-sm',
              whiteSpace: 'nowrap',
              ...animation
            })}
            style={toc ? {
              animationName: fadeOut,
              animationTimeline: 'scroll()',
              animationRange,
              animationPlayState: isTransitioning ? 'paused' : undefined,
              display: isOpen ? 'none' : undefined
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
            animationRange,
            animationPlayState: isTransitioning ? 'paused' : undefined
          } as CSSProperties}>
          {toc}
        </div>
      )}
      <DialogTrigger
        isOpen={isOpen}
        onOpenChange={onOpenChange}>
        <ActionButton aria-label="Navigation" isQuiet>
          <MenuHamburger />
        </ActionButton>
        <ModalOverlay
          // Keep in the DOM after it has opened once to preserve scroll position.
          isExiting={!isOpen && wasOpen}
          style={{
            display: !isOpen ? 'none' : undefined,
            // @ts-ignore
            viewTransitionName: 'search-menu-underlay'
          }}
          className={style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'full',
            height: '--page-height',
            isolation: 'isolate',
            '--s2-container-bg': {
              type: 'backgroundColor',
              value: 'layer-2'
            },
            backgroundColor: '--s2-container-bg'
          })}>
          <Modal
            className={style({
              position: 'sticky',
              top: 0,
              left: 0,
              width: 'full',
              height: '--visual-viewport-height'
            })}>
            <MobileSearchMenu />
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
  );
}
