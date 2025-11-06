'use client';

import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { useEffect, useState } from 'react';
import { useDateFormatter } from 'react-aria';
// @ts-ignore
import iphone from 'url:@react-spectrum/docs/pages/assets/iphone-frame.webp';
// @ts-ignore
import iphoneMask from 'url:@react-spectrum/docs/pages/assets/iphone-mask.webp';
import {WifiIcon} from 'lucide-react';

export function Mobile() {
  return (
    <div
      className={style({
        size: 'full',
        backgroundSize: 'cover'
      })}
      style={{
        backgroundImage: `url(${iphone.split('?')[0]})`
      }}>
      <div
        className={style({
          size: 'full'
        })}
        style={{
          maskImage: `url(${iphoneMask.split('?')[0]}), linear-gradient(#fff 0 0)`,
          maskSize: 'cover',
          maskComposite: 'exclude',
          padding: '8%',
          boxSizing: 'border-box'
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
            fontWeight: 'medium',
            borderWidth: 0,
            borderBottomWidth: 1,
            borderColor: 'gray-100',
            borderStyle: 'solid'
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
      </div>
    </div>
  );
}

function Clock() {
  let formatter = useDateFormatter({
    timeStyle: 'short'
  });

  let [time, setTime] = useState(() => new Date());

  useEffect(() => {
    let nextMinute = Math.floor((Date.now() + 60000) / 60000) * 60000;
    let timeout = setTimeout(() => {
      setTime(new Date());
    }, nextMinute - Date.now());

    return () => clearTimeout(timeout);
  });

  return (
    <span className="text-xs font-semibold">
      {formatter.format(time)}
    </span>
  );
}
