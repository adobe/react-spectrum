'use client';

import { Provider } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useRef, useState } from "react";
import { useMove } from "react-aria";
// @ts-ignore
import Nubbin from '../../../../../@react-spectrum/s2/ui-icons/S2_MoveHorizontalTableWidget.svg';
import { AppFrame, ExampleApp } from "./ExampleApp";

export function DarkMode() {
  let containerRef = useRef(null);
  return (
    <div className={style({position: 'relative'})} style={{containerType: 'size', height: 350} as any} ref={containerRef}>
      <Resizable containerRef={containerRef}>
        <Provider colorScheme="light" styles={style({width: '100cqw', height: '100cqh'})}>
          <AppFrame inert />
        </Provider>
      </Resizable>
      <Provider colorScheme="dark" styles={style({position: 'absolute', inset: 0})}>
        <AppFrame inert />
      </Provider>
    </div>
  );
}

export function Resizable({children, containerRef}: any) {
  let [percent, setPercent] = useState(50);
  let pos = useRef(0);
  let {moveProps} = useMove({
    onMoveStart(e) {
      pos.current = containerRef.current!.getBoundingClientRect().width * percent / 100;
    },
    onMove(e) {
      let newPos = pos.current + (e.pointerType === 'keyboard' ? (e.deltaX || -e.deltaY) * 20 : e.deltaX);
      let percent = Math.max(0, Math.min(100, newPos / containerRef.current!.getBoundingClientRect().width * 100));
      setPercent(percent);
      pos.current = newPos;
    }
  });

  return (
    <>
      <div style={{width: percent + '%', overflow: 'clip', position: 'relative', zIndex: 2}}>
        <div>
          {children}
        </div>
      </div>
      <div
        {...moveProps}
        role="separator"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={style({
          position: 'absolute',
          top: -12,
          bottom: -12,
          paddingX: 12,
          marginX: -12,
          cursor: 'col-resize',
          zIndex: 4,
          outlineStyle: 'none'
        })}
        style={{
          left: percent + '%'
        }}>
        <div
          className={style({
            width: 4,
            height: 'full',
            backgroundColor: {
              default: 'pink-700',
              forcedColors: 'Highlight'
            },
            borderRadius: '[4px]'
          })} />
        <div
          className={style({
            position: 'absolute',
            top: '50%',
            left: '50%',
            translateY: '-50%',
            translateX: '-50%',
            scale: 1.5,
            fill: {
              default: 'pink-700',
              forcedColors: 'Highlight'
            },
            '--iconPrimary': {
              type: 'fill',
              value: {
                default: 'white',
                forcedColors: 'HighlightText'
              }
            }
          })}>
          <Nubbin />
        </div>
      </div>
    </>
  );
}
