'use client';

import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function ColorSwatch({name}) {
  return (
    <div className={style({display: 'flex', gap: 8, marginBottom: 4, font: 'ui', alignItems: 'center', breakInside: 'avoid'})}>
      <div
        className={style({
          backgroundColor: {
            color: {
              white: 'white',
              black: 'black',
              accent: 'accent',
              neutral: 'neutral',
              negative: 'negative',
              informative: 'informative',
              positive: 'positive',
              notice: 'notice',
              gray: 'gray',
              red: 'red',
              orange: 'orange',
              yellow: 'yellow',
              chartreuse: 'chartreuse',
              celery: 'celery',
              seafoam: 'seafoam',
              cyan: 'cyan',
              blue: 'blue',
              indigo: 'indigo',
              purple: 'purple',
              fuchsia: 'fuchsia',
              magenta: 'magenta',
              pink: 'pink',
              turquoise: 'turquoise',
              cinnamon: 'cinnamon',
              brown: 'brown',
              silver: 'silver'
            }
          },
          size: 20,
          borderRadius: 'sm',
          borderWidth: 1,
          borderColor: 'gray-1000/15',
          borderStyle: 'solid'
        })({color: name})} />
      <div>{name}</div>
    </div>
  );
}

export function IconColors({colors}: {colors: string[]}) {
  return (
    <div style={{columnWidth: 100}}>
      {colors.map((color) => (
        <ColorSwatch key={color} name={color} />
      ))}
    </div>
  );
}
