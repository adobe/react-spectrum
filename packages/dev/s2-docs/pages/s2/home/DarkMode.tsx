'use client';

import { Provider } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useRef, useState } from "react";
import { useMove } from "react-aria";
// @ts-ignore
import Nubbin from '../../../../../@react-spectrum/s2/ui-icons/S2_MoveHorizontalTableWidget.svg';
import { ExampleApp } from "./ExampleApp";

export function DarkMode() {
  let containerRef = useRef(null);
  return (
    <div className={style({position: 'relative'})} style={{containerType: 'size', height: 350} as any} ref={containerRef}>
      <Resizable containerRef={containerRef}>
        <Provider colorScheme="light" background="layer-1" styles={style({padding: 16, paddingBottom: 0, overflow: 'clip', boxSizing: 'border-box', borderStartRadius: 'lg', width: '100cqw', height: '100cqh'})}>
          <ExampleApp />
        </Provider>
      </Resizable>
      <Provider colorScheme="dark" background="layer-1" styles={style({padding: 16, paddingBottom: 0, overflow: 'clip', boxSizing: 'border-box', position: 'absolute', inset: 0, borderRadius: 'lg'})}>
        <ExampleApp />
      </Provider>
    </div>
  );
}

function Resizable({children, containerRef}: any) {
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
        <div className={style({minWidth: 'max'})}>
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
            backgroundColor: 'pink-700',
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
            fill: 'pink-700',
            '--iconPrimary': {
              type: 'fill',
              value: 'white'
            }
          })}>
          <Nubbin />
        </div>
      </div>
    </>
  );
}
