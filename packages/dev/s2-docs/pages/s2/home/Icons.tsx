'use client';

import { useState } from 'react';
// @ts-ignore
import icons from '/packages/@react-spectrum/s2/s2wf-icons/S2_Icon_[A-D]*.svg';
import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
// @ts-ignore
import illustrations from '/packages/@react-spectrum/s2/spectrum-illustrations/gradient/generic1/[A-E]*.tsx';
import { IllustrationContext } from '@react-spectrum/s2';

export function Icons() {
  return <IconGrid icons={icons} size={32} />;
}

export function Illustrations() {
  return (
    <IllustrationContext.Provider value={{size: 'S'}}>
      <IconGrid icons={illustrations} size={48} intensity={0.2} />
    </IllustrationContext.Provider>
  );
}

function IconGrid({icons, size, radius = 4 * size, intensity = 0.5}: any) {
  let [cols, setCols] = useState(22);
  let [pos, setPos] = useState<{x: number, y: number} | null>(null);
  let [transition, setTransition] = useState(true);

  return (
    <div
      className={style({
        display: 'grid',
      })}
      ref={el => {
        if (el) {
          setCols(Math.floor(el.getBoundingClientRect().width / size));
        }
      }}
      style={{
        gridTemplateColumns: `repeat(auto-fit, ${size}px)`,
        gridAutoRows: size
      }}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') {
          setTransition(true);
          setTimeout(() => {
            setTransition(false);
          }, 250);
        }
      }}
      onPointerMove={e => {
        if (e.pointerType === 'mouse') {
          let rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: e.clientX - rect.x,
            y: e.clientY - rect.y
          })
        }
      }}
      onPointerLeave={(e) => {
        setPos(null);
        if (e.pointerType === 'mouse') {
          setTransition(true);
        }
      }}>
      {Object.values(icons).map((icon: any, i) => {
        let scale = 1;
        let opacity = 1;
        if (pos) {
          let row = Math.floor(i / cols);
          let col = i % cols;
          let cx = col * size + size / 2;
          let cy = row * size + size / 2;
          let dx = pos.x - cx;
          let dy = pos.y - cy;
          let dist = Math.sqrt(dx * dx + dy * dy);

          let falloff = Math.max(0, 1 - dist / radius);
          scale = 1 + falloff * intensity;
          opacity = Math.max(0.6, 1 - (dist / 400) * intensity);
        }
        return (
          <div
            key={i}
            style={{
              scale,
              opacity,
              transition: transition ? 'scale 150ms, opacity 250ms' : undefined
            }}>
            {<icon.default size="S" />}            
          </div>
        );
      })}
    </div>
  )
}
