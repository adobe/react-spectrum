'use client';

import { Provider } from "@react-spectrum/s2";
import { focusRing, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useRef, useState } from "react";
import { mergeProps, useFocusRing, useMove } from "react-aria";
// @ts-ignore
import Nubbin from '../../../../../@react-spectrum/s2/ui-icons/S2_MoveHorizontalTableWidget.svg';
import { AppFrame } from "./ExampleApp";

export function DarkMode() {
  let containerRef = useRef(null);
  return (
    <div
      className={style({
        position: 'relative',
        borderRadius: 'lg',
        boxShadow: 'elevated',
        containerType: 'size',
        height: 350,
        margin: {
          default: -16,
          sm: 0
        },
        marginTop: 0,
        borderTopStartRadius: {
            default: 'none',
            sm: 'lg'
        },
        '--app-frame-radius-top': {
          type: 'borderTopStartRadius',
          value: {
            default: 'none',
            sm: 'lg'
          }
        },
        '--app-frame-shadow': {
          type: 'boxShadow',
          value: 'none'
        }
      })}
      ref={containerRef}>
      <Resizable containerRef={containerRef} isClipped>
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

export function Resizable({children, containerRef, isClipped, minWidth = 0}: any) {
  let [percent, setPercent] = useState(50);
  let ref = useRef<HTMLDivElement | null>(null);
  let pos = useRef(0);
  let {focusProps, isFocusVisible} = useFocusRing();
  let {moveProps} = useMove({
    onMoveStart() {
      pos.current = ref.current!.getBoundingClientRect().width;
    },
    onMove(e) {
      let newPos = pos.current + (e.pointerType === 'keyboard' ? (e.deltaX || -e.deltaY) * 20 : e.deltaX);
      let constrainedPos = Math.max(minWidth, newPos);
      let percent = Math.max(0, Math.min(100, constrainedPos / containerRef.current!.getBoundingClientRect().width * 100));
      setPercent(percent);
      pos.current = newPos;
    }
  });

  return (
    <>
      <div
        ref={ref}
        style={{
          height: '100%',
          minWidth: minWidth,
          width: percent + '%',
          overflow: isClipped ? 'clip' : undefined,
          position: 'relative',
          zIndex: isClipped ? 2 : undefined
        }}>
        {children}
      </div>
      <div
        {...mergeProps(focusProps, moveProps)}
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
          outlineStyle: 'none',
          touchAction: 'none'
        })}
        style={{
          left: `max(${minWidth}px, ${percent}%)`,
          zIndex: isClipped ? 4 : undefined,
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
            ...focusRing(),
            borderRadius: 'full',
            position: 'absolute',
            top: '50%',
            left: '50%',
            translateY: '-50%',
            translateX: '-50%',
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
          })({isFocusVisible})}>
          <Nubbin className={style({display: 'block', size: 24})} />
        </div>
      </div>
    </>
  );
}
