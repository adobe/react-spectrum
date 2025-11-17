'use client';
import {animate, useIntersectionObserver} from '@react-spectrum/docs/pages/react-aria/home/utils';
import {ReactNode, RefObject, useCallback, useRef, useState} from 'react';
import {Button, Checkbox} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {FocusableRefValue} from '@react-types/shared';

const pos = (x: number) => `calc(${x / 16}rem * var(--s2-scale, 1))`;
const translate = (x: number, y: number) => `translate(${pos(x)}, ${pos(y)})`;

export function PressAnimation(): ReactNode {
  let ref = useRef(null);
  let mouseRef = useRef<SVGSVGElement>(null);
  let checkboxRef = useRef<FocusableRefValue<HTMLLabelElement>>(null);
  let buttonRef = useRef<FocusableRefValue<HTMLButtonElement>>(null);
  let [isChecked, setChecked] = useState(false);

  useIntersectionObserver(ref, useCallback(() => {
    let cancel =  animate([
      {
        time: 500,
        perform() {}
      },
      {
        time: 700,
        perform() {
          mouseRef.current!.animate({
            transform: [
              translate(-50, 150),
              translate(10, 10)
            ]
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 500,
        perform() {
          pointer(checkboxRef, 'pointerover');
        }
      },
      {
        time: 300,
        perform() {
          pointer(checkboxRef, 'pointerdown');
        }
      },
      {
        time: 500,
        perform() {
          pointer(checkboxRef, 'pointerup');
        }
      },
      {
        time: 450,
        perform() {
          mouseRef.current!.animate({
            transform: [
              translate(10, 10),
              translate(200, 10)
            ]
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 200,
        perform() {
          pointer(checkboxRef, 'pointerout');
        }
      },
      {
        time: 500,
        perform() {
          pointer(buttonRef, 'pointerover');
        }
      },
      {
        time: 300,
        perform() {
          pointer(buttonRef, 'pointerdown');
        }
      },
      {
        time: 500,
        perform() {
          pointer(buttonRef, 'pointerup');
        }
      },
      {
        time: 200,
        perform() {
          mouseRef.current!.animate({
            transform: [
              translate(200, 10),
              translate(250, 150)
            ]
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 100,
        perform() {
          buttonRef.current?.UNSAFE_getDOMNode()!.dispatchEvent(new PointerEvent('pointerout', {pointerType: 'mouse', pointerId: 1, bubbles: true, detail: 1}));
        }
      },
    ]);

    return () => {
      cancel();
      setChecked(false);
      mouseRef.current!.getAnimations().forEach(a => a.cancel());
    };
  }, []));

  return (
    <div ref={ref} className={style({display: 'flex', columnGap: 32, alignItems: 'center', marginX: 'auto', marginTop: 20, width: 'fit'})}>
      <svg
        ref={mouseRef}
        viewBox="0 0 12 19"
        width={12}
        height={19}
        aria-hidden="true"
        style={{
          position: 'absolute',
          zIndex: 10,
          filter: 'drop-shadow(0 1px 1px #aaa)',
          transform: 'translate(-50px, 150px)'
        }}>
        <g transform="matrix(1, 0, 0, 1, -150, -63.406998)">
          <path d="M150 79.422V63.407l11.591 11.619h-6.781l-.411.124Z" fill="#fff" fillRule="evenodd" />
          <path d="m159.084 80.1-3.6 1.535-4.684-11.093 3.686-1.553Z" fill="#fff" fillRule="evenodd" />
          <path d="m157.751 79.416-1.844.774-3.1-7.374 1.841-.775Z" fillRule="evenodd" />
          <path d="M151 65.814V77l2.969-2.866.431-.134h4.768Z" fillRule="evenodd" />
        </g>
      </svg>
      <Checkbox ref={checkboxRef} size="XL" isSelected={isChecked} onChange={setChecked}>Accept terms</Checkbox>
      <Button ref={buttonRef} variant="accent" size="XL">Submit</Button>
    </div>
  );
}

function pointer(ref: RefObject<FocusableRefValue<HTMLElement> | null>, type: string) {
  ref.current?.UNSAFE_getDOMNode()!.dispatchEvent(new PointerEvent(type, {pointerType: 'mouse', pointerId: 1, bubbles: true, detail: 1}));
}
