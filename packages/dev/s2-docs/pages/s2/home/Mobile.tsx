'use client';

import { lightDark, style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDateFormatter } from 'react-aria';
// @ts-ignore
import iphone from 'url:@react-spectrum/docs/pages/assets/iphone-frame.webp';
// @ts-ignore
import iphoneMask from 'url:@react-spectrum/docs/pages/assets/iphone-mask.webp';
import {WifiIcon} from 'lucide-react';
import { Avatar, Button, Form, TextField } from '@react-spectrum/s2';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import Search from '@react-spectrum/s2/icons/Search';
import More from '@react-spectrum/s2/icons/More';
// @ts-ignore
import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import {animate, useIntersectionObserver} from '@react-spectrum/docs/pages/react-aria/home/utils';
import {TextFieldRef} from '@react-types/textfield';
import {FocusableRefValue} from '@react-types/shared';

const translate = (x: number, y: number) => `translate(${x}px, ${y}px)`;

export function Mobile() {
  let containerRef = useRef<HTMLDivElement | null>(null);
  let toolbarRef = useRef<HTMLDivElement | null>(null);
  let fingerRef = useRef<HTMLDivElement | null>(null);
  let textFieldRef = useRef<TextFieldRef | null>(null);
  let buttonRef = useRef<FocusableRefValue<HTMLButtonElement> | null>(null);
  let [value, setValue] = useState('');
  let [isAnimating, setAnimating] = useState(false);

  useIntersectionObserver(toolbarRef, useCallback(() => {
    if (matchMedia('(prefers-reduced-motion)').matches) {
      return;
    }

    let cancel =  animate([
      {
        time: 500,
        perform() {
          setAnimating(true);
        }
      },
      {
        time: 1000,
        perform() {
          let node = textFieldRef.current!.getInputElement()!.parentElement!;
          fingerRef.current!.animate({
            transform: translate(node.offsetLeft + 40, node.offsetTop + node.offsetHeight / 2 - fingerRef.current!.offsetHeight / 2)
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 250,
        perform() {
          fingerRef.current!.animate({
            opacity: [
              0.5,
              0.8,
              0.5,
              0
            ]
          }, {duration: 800, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 800 + 80 * 'user@example.com'.length + 200,
        async perform() {
          let node = textFieldRef.current!.getInputElement()!;
          fakeFocus(node, 'focus');


          await new Promise(res => setTimeout(res, 800));
          setValue('');
          for (let c of 'user@example.com') {
            setValue(value => value + c);
            await new Promise(res => setTimeout(res, 80));
          }
        }
      },
      {
        time: 250,
        perform() {
          fingerRef.current!.animate({
            opacity: [
              0,
              0.5
            ]
          }, {duration: 500, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 1200,
        perform() {
          let node = buttonRef.current!.UNSAFE_getDOMNode()!;
          fingerRef.current!.animate({
            transform: translate(node.offsetLeft + node.offsetWidth / 2 - fingerRef.current!.offsetWidth / 2, node.offsetTop + node.offsetHeight / 2 - fingerRef.current!.offsetHeight / 2)
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 300,
        perform() {
          let node = textFieldRef.current!.getInputElement()!;
          fakeFocus(node, 'blur');

          fingerRef.current!.animate({
            opacity: [
              0.5,
              0.8,
              0.5
            ]
          }, {duration: 550, fill: 'forwards', easing: 'ease-in-out'});

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
        time: 500,
        perform() {
          let node = buttonRef.current!.UNSAFE_getDOMNode()!;
          fingerRef.current!.animate({
            transform: translate(node.offsetLeft, 300)
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 0,
        perform() {
          setAnimating(false);
        }
      }
    ]);

    return () => {
      cancel();
      setValue('');
      setAnimating(false);
      fingerRef.current!.getAnimations().forEach(a => a.cancel());
    };
  }, []));

  return (
    <div
      inert={isAnimating || undefined}
      className={style({
        size: 'full',
        maxWidth: 464,
        minHeight: 340,
        marginX: 'auto',
        marginBottom: -40,
        backgroundSize: 'cover',
        contain: 'size'
      })}
      style={{
        backgroundImage: `url(${iphone.split('?')[0]})`
      }}>
      <div
        className={style({
          size: 'full',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'layer-1'
        })}
        style={{
          maskImage: `url(${iphoneMask.split('?')[0]}), linear-gradient(#fff 0 0)`,
          maskSize: '100%',
          maskComposite: 'exclude',
          padding: '8%',
          paddingBottom: 0
        }}>
        <div
          className={style({
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingX: 28,
            paddingY: 16,
            boxSizing: 'border-box',
            font: 'ui',
            fontWeight: 'medium'
          })}>
          <Clock />
          <span className={style({flexGrow: 1})} />
          <WifiIcon className={style({size: 16})} />
          <svg viewBox="0 0 28 24" className={style({height: 24, stroke: 'gray-600'})} fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="10" x="2" y="7" rx="3" ry="3" />
            <rect width="13" height="7" x="3.5" y="8.5" rx="2" ry="2" fill="currentColor" stroke="none" />
            <line x1="25" x2="25" y1="11" y2="13" strokeWidth="2" />
          </svg>
        </div>
        <div className={style({flexGrow: 1})} style={{'--s2-scale': '1.25', '--s2-font-size-base': '17'} as any}>
          <div
            className={style({
              display: 'flex',
              flexDirection: 'column',
              height: 'full'
            })}>
              <div
                ref={toolbarRef}
                className={style({
                  gridArea: 'toolbar',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  width: 'full',
                  paddingY: 12,
                  paddingX: 12,
                  boxSizing: 'border-box'
                })}>
                <MenuHamburger />
                <AdobeLogo size={24} />
                <div className={style({flexGrow: 1})} />
                <Search />
                <More />
                <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
              </div>
              <div
                ref={containerRef}
                className={style({
                  gridArea: 'content',
                  backgroundColor: 'base',
                  flexGrow: 1,
                  minHeight: 0,
                  width: 'full',
                  overflow: 'clip',
                  paddingX: 12,
                  paddingTop: 12,
                  boxSizing: 'border-box',
                  position: 'relative'
                })}>
                <div className={style({font: 'title', marginBottom: 16})}>Subscribe to our newsletter</div>
                <Form labelPosition="side">
                  <TextField label="Email" placeholder="Enter your email" ref={textFieldRef} value={value} onChange={setValue} />
                  <Button variant="accent" ref={buttonRef} styles={style({gridColumnStart: 'field', justifySelf: 'end'})}>Subscribe</Button>
                </Form>
                <Finger ref={fingerRef} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock() {
  let formatter = useDateFormatter({
    timeStyle: 'short'
  });

  let [time, setTime] = useState(() => new Date(2025, 0, 1));

  useEffect(() => {
    setTime(new Date());
  }, []);

  useEffect(() => {    
    let nextMinute = Math.floor((Date.now() + 60000) / 60000) * 60000;
    let timeout = setTimeout(() => {
      setTime(new Date());
    }, nextMinute - Date.now());

    return () => clearTimeout(timeout);
  });

  return (
    <span>{formatter.format(time)}</span>
  );
}

function Finger({ref}: any) {
  return (
    <div
      ref={ref}
      style={{transform: translate(0, 300)}}
      className={style({
        zIndex: 10,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        borderRadius: 'full',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: lightDark('black/80', 'white/80'),
        backgroundColor: lightDark('black/80', 'white/80'),
        opacity: 0.5
      })} />
  );
}

function pointer(ref: RefObject<FocusableRefValue<HTMLElement> | null>, type: string) {
  ref.current?.UNSAFE_getDOMNode()!.dispatchEvent(new PointerEvent(type, {pointerType: 'mouse', pointerId: 1, bubbles: true, detail: 1}));
}

function fakeFocus(node: HTMLElement, type: 'focus' | 'blur') {
  Object.defineProperty(document, 'activeElement', {value: node, configurable: true});
  let relatedTarget = type === 'focus' ? document.activeElement : null;
  node.dispatchEvent(new FocusEvent(type, {relatedTarget}));
  node.dispatchEvent(new FocusEvent(type === 'blur' ? 'focusout' : 'focusin', {bubbles: true, relatedTarget}));
  // @ts-ignore
  delete document.activeElement;
}
