'use client';
import {animationQueue, useIntersectionObserver} from '@react-spectrum/docs/pages/react-aria/home/utils';
import {flushSync} from 'react-dom';
import React, {ReactNode, useCallback, useRef, useState} from 'react';
import {Button} from '@react-spectrum/s2';
import './Press.css';
import { lightDark, style } from '@react-spectrum/s2/style' with {type: 'macro'};

export function PressAnimation(): ReactNode {
  let ref = useRef(null);
  let [isAnimating, setAnimating] = useState(false);
  // let [isSelected, setSelected] = useState(true);

  useIntersectionObserver(ref, useCallback(() => {
    let job = {
      isCanceled: false,
      async run() {
        flushSync(() => {
          setAnimating(true);
        });
        let animation = document.getAnimations()
          .find(anim => anim instanceof CSSAnimation && anim.animationName === 'touch-animation');
        try {
          await animation?.finished;
        } catch {
          // ignore abort errors.
        }
        setAnimating(false);
      }
    };

    animationQueue.next(job);

    return () => {
      job.isCanceled = true;
      setAnimating(false);
      // setSelected(true);
    };
  }, []));

  // switch-background-animation 12s ease-in-out 500ms
  return (
    <>
      {/* <Finger isAnimating={true} /> */}
      <svg
        viewBox="0 0 12 19"
        width={12}
        height={19}
        aria-hidden="true"
        style={{
          position: 'absolute',
          zIndex: 10,
          filter: 'drop-shadow(0 1px 1px #aaa)',
          transform: 'translate(30px, 15px)',
          translate: '-50px 150px',
          animation: 'mouse-animation 4s ease-in-out'
        }}>
        <g transform="matrix(1, 0, 0, 1, -150, -63.406998)">
          <path d="M150 79.422V63.407l11.591 11.619h-6.781l-.411.124Z" fill="#fff" fillRule="evenodd" />
          <path d="m159.084 80.1-3.6 1.535-4.684-11.093 3.686-1.553Z" fill="#fff" fillRule="evenodd" />
          <path d="m157.751 79.416-1.844.774-3.1-7.374 1.841-.775Z" fillRule="evenodd" />
          <path d="M151 65.814V77l2.969-2.866.431-.134h4.768Z" fillRule="evenodd" />
        </g>
      </svg>
      <Button variant="accent" UNSAFE_style={{animation: 'press-animation 4s ease-in-out'}}>Action</Button>
    </>
  );
}

// const Finger2 = React.forwardRef((props: HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement | null>) => {
//   return <div ref={ref} className="z-10 pointer-events-none absolute w-10 h-10 rounded-full border border-black/80 bg-black/80 dark:border-white/80 dark:bg-white/80 dark:mix-blend-difference opacity-0 [--hover-opacity:0.15] [--pressed-opacity:0.3] forced-colors:[--hover-opacity:0.5] forced-colors:[--pressed-opacity:1] forced-colors:bg-[Highlight]! forced-colors:mix-blend-normal!" {...props} />;
// });

function Finger({isAnimating}: any) {
  return (
    <div
      style={{animation: isAnimating ? 'touch-animation 2s ease-in-out infinite' : undefined}}
      className={style({
        zIndex: 10,
        pointerEvents: 'none',
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 'full',
        borderStyle: 'solid',
        borderColor: lightDark('black/80', 'white/80'),
        backgroundColor: lightDark('black/80', 'white/80'),
        mixBlendMode: 'difference',
        opacity: 0,
        '--hover-opacity': {
          type: 'opacity',
          value: 0.15
        },
        '--pressed-opacity': {
          type: 'opacity',
          value: 0.3
        }
      })} />
  );
}
