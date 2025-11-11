'use client';

import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { useEffect, useState } from 'react';
import { useDateFormatter } from 'react-aria';
// @ts-ignore
import iphone from 'url:@react-spectrum/docs/pages/assets/iphone-frame.webp';
// @ts-ignore
import iphoneMask from 'url:@react-spectrum/docs/pages/assets/iphone-mask.webp';
import {WifiIcon} from 'lucide-react';
import { Avatar } from '@react-spectrum/s2';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import Search from '@react-spectrum/s2/icons/Search';
import More from '@react-spectrum/s2/icons/More';
import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import { SkeletonCard } from './ExampleApp';

export function Mobile() {
  return (
    <div
      className={style({
        size: 'full',
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
          maskSize: 'cover',
          maskComposite: 'exclude',
          padding: '8%',
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
            // borderWidth: 0,
            // borderBottomWidth: 1,
            // borderColor: 'gray-100',
            // borderStyle: 'solid'
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
          {/* <Button variant="accent">Press me!</Button> */}
          <div
            inert
            className={style({
              display: 'flex',
              flexDirection: 'column',
              height: 'full'
            })}>
              <div
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
                <span className={style({font: 'title'})}>React Spectrum</span>
                {/* <div className={style({flexGrow: 1})}>
                  <SearchField placeholder={direction === 'rtl' ? 'يبحث' : 'Search'} styles={style({maxWidth: 300, marginX: 'auto'})} />
                </div> */}
                {/* <HelpCircle />
                <Bell />
                <Apps /> */}
                <div className={style({flexGrow: 1})} />
                <Search />
                <More />
                <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
              </div>
              <div
                className={style({
                  gridArea: 'content',
                  backgroundColor: 'base',
                  flexGrow: 1,
                  minHeight: 0,
                  width: 'full',
                  overflow: 'clip',
                  paddingX: 12,
                  paddingTop: 12,
                  boxSizing: 'border-box'
                })}>
                <div className={style({font: 'heading'})}>Recents</div>
                <div
                  className={style({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
                    gridTemplateRows: 'min-content',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginTop: 16
                  })}>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
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
