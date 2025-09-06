'use client';

import {ActionButton, CloseButton, DialogTrigger} from '@react-spectrum/s2';
import {AdobeLogo} from './AdobeLogo';
import {composeRenderProps, OverlayTriggerStateContext, Dialog as RACDialog, DialogProps as RACDialogProps} from 'react-aria-components';
import {keyframes} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import {Modal} from '../../../@react-spectrum/s2/src/Modal';
import React, {CSSProperties, forwardRef, useEffect, useRef} from 'react';
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

interface MobileDialogProps extends Omit<RACDialogProps, 'className' | 'style'> {
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  isDismissible?: boolean,
  isKeyboardDismissDisabled?: boolean,
  padding?: 'default' | 'none'
}

const dialogStyle = style({
  padding: {
    padding: {
      default: {
        default: 24,
        sm: 32
      },
      none: 0
    }
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: 'inherit',
  overflow: 'auto',
  position: 'relative',
  size: 'full',
  maxSize: 'inherit'
});

const MobileCustomDialog = forwardRef<HTMLDivElement, MobileDialogProps>(function MobileCustomDialog(props, ref) {
  let {
    size,
    isDismissible,
    isKeyboardDismissDisabled,
    padding = 'default'
  } = props;

  return (
    <Modal size={size} isDismissable={isDismissible} isKeyboardDismissDisabled={isKeyboardDismissDisabled} style={{zIndex: 100}}>
      <RACDialog
        {...props}
        ref={ref}
        className={dialogStyle({padding})}>
        {composeRenderProps(props.children, (children) => (
          <OverlayTriggerStateContext.Provider value={null}>
            {children}
          </OverlayTriggerStateContext.Provider>
        ))}
      </RACDialog>
    </Modal>
  );
});

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
      <DialogTrigger>
        <ActionButton aria-label="Navigation" isQuiet>
          <MenuHamburger />
        </ActionButton>
        <MobileCustomDialog size="fullscreenTakeover" padding="none">
          <CloseButton styles={style({position: 'fixed', top: 12, insetEnd: 12, zIndex: 101})} />
          {nav}
        </MobileCustomDialog>
      </DialogTrigger>
    </div>
  );
}
