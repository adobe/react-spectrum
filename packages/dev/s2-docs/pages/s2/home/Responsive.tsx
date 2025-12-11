'use client';

import React, { useRef } from "react";
import { Resizable } from "./DarkMode";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { ExampleApp } from "./ExampleApp";

export function Responsive() {
  let containerRef = useRef(null);
  return (
    <div
      className={style({
        margin: {
          default: -16,
          sm: 0
        },
        marginTop: 0,
        '--app-frame-radius-top': {
          type: 'borderTopStartRadius',
          value: {
            default: 'none',
            sm: 'lg'
          }
        }
      })}>
      <div
        className={style({
          position: 'relative',
          height: 32,
          width: '150%',
          boxSizing: 'border-box',
          borderWidth: 1,
          borderColor: 'cinnamon-500',
          borderStyle: 'solid',
          marginBottom: 16,
          backgroundColor: 'cinnamon-300',
          borderRadius: 'default',
          overflow: 'clip',
          display: {
            default: 'none',
            sm: 'block'
          }
        })}>
        <MiniTicks />
        <Tick name="default" pos={0} />
        <Tick name="xs" pos={480} />
        <Tick name="sm" pos={640} />
        <Tick name="md" pos={768} />
        <Tick name="lg" pos={1024} />
        <Tick name="xl" pos={1280} />
      </div>
      <div
        ref={containerRef}
        className={style({
          position: 'relative',
          height: 500,
          display: {
            default: 'none',
            sm: 'block'
          }}
        )}>
        <Resizable minWidth={330} containerRef={containerRef}>
          <ExampleApp />
        </Resizable>
      </div>
      <div
        className={style({
          position: 'relative',
          height: 500,
          display: {
            default: 'block',
            sm: 'none'
          }}
        )}>
        <ExampleApp />
      </div>
    </div>
  );
}

function Tick({name, pos}: {name: string, pos: number}) {
  return (
    <div
      style={{insetInlineStart: (pos - 1) / 16 + 'rem'}}
      className={style({
        position: 'absolute',
        borderWidth: 0,
        borderStartWidth: 1,
        borderColor: 'cinnamon-700',
        borderStyle: 'solid',
        paddingStart: 8,
        font: 'code-sm',
        color: 'cinnamon-1400',
        height: 'full',
        display: 'flex',
        alignItems: 'center'
      })}>
      {name}
    </div>
  );
}

function MiniTicks() {
  let ticks: React.ReactElement[] = [];
  for (let i = 0; i < 1536; i += 16) {
    ticks.push(
      <div
        key={i}
        style={{
          insetInlineStart: (i - 1) / 16 + 'rem',
          height: i % 64 === 0 ? 6 : 4
        }}
        className={style({
          position: 'absolute',
          borderWidth: 0,
          borderStartWidth: 1,
          borderColor: 'cinnamon-700',
          borderStyle: 'solid',
          bottom: 0
        })} />
    );
  }

  return <>{ticks}</>;
}
