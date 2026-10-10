/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
'use client';

import React, {
  CSSProperties,
  JSX,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import {Button} from 'vanilla-starter/Button';
import {Checkbox} from 'vanilla-starter/Checkbox';
import {Label, Meter as AriaMeter} from 'react-aria-components/Meter';

// Size of the demo "window". The scroller is twice as tall, with the bottom half clipped.
const W = 240;
const H = 360;
const SHEET_HEIGHT = 280;

const css = `
@keyframes sheet-demo-backdrop {
  from { opacity: 0; }
  to { opacity: 0.5; }
}

@keyframes sheet-demo-radius {
  from { border-top-left-radius: 8px; border-top-right-radius: 8px; }
  to { border-top-left-radius: 24px; border-top-right-radius: 24px; }
}

.sheet-demo-scroller {
  scrollbar-width: none;
}

.sheet-demo-scroller::-webkit-scrollbar {
  display: none;
}
`;

const colors = {
  fg: 'light-dark(#24292f, #e6edf3)',
  muted: 'light-dark(#57606a, #9198a1)',
  line: 'light-dark(#8c959f, #6e7681)',
  page: 'light-dark(#f6f8fa, #161b22)',
  pageLine: 'light-dark(#d0d7de, #30363d)',
  surface: 'light-dark(#ffffff, #2d333b)',
  grabber: 'light-dark(#afb8c1, #6e7681)',
  viewport: 'light-dark(#bf5700, #f0883e)',
  stage: 'light-dark(#0969da, #4493f8)',
  marker: 'light-dark(#8250df, #ab7df8)'
};

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

interface Readout {
  progress: number;
  opacity: string;
  radius: string;
}

export function SheetTimelineDemo(): JSX.Element {
  let scrollRef = useRef<HTMLDivElement>(null);
  let sheetRef = useRef<HTMLDivElement>(null);
  let backdropRef = useRef<HTMLDivElement>(null);
  let frameRef = useRef<HTMLDivElement>(null);
  let [showHidden, setShowHidden] = useState(false);
  let [isSupported, setSupported] = useState(true);
  let [readout, setReadout] = useState<Readout>({progress: 1, opacity: '0.5', radius: '24px'});

  let update = useCallback(() => {
    let frame = frameRef.current;
    let sheet = sheetRef.current;
    let backdrop = backdropRef.current;
    if (!frame || !sheet || !backdrop) {
      return;
    }

    // Matches the `entry` range of the view timeline: how much of the sheet has entered the
    // visible (top) half of the scroller.
    let top = sheet.getBoundingClientRect().top - frame.getBoundingClientRect().top;
    let progress = Math.min(1, Math.max(0, (H - top) / SHEET_HEIGHT));
    setReadout({
      progress,
      opacity: Number(getComputedStyle(backdrop).opacity).toFixed(2),
      radius: `${Math.round(parseFloat(getComputedStyle(sheet).borderTopLeftRadius))}px`
    });
  }, []);

  useLayoutEffect(() => {
    // Start open.
    if (scrollRef.current) {
      scrollRef.current.scrollTop = H;
    }
    setSupported(typeof CSS !== 'undefined' && CSS.supports('view-timeline-name', '--a'));

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(update);
    });

    return () => cancelAnimationFrame(frame);
  }, [update]);

  useEffect(() => {
    let scroller = scrollRef.current;
    if (!scroller) {
      return;
    }

    let frame = 0;
    let onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    scroller.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [update]);

  let scrollTo = (top: number) => {
    scrollRef.current?.scrollTo({top, behavior: 'smooth'});
  };

  let isClosed = readout.progress === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        alignItems: 'flex-start',
        justifyContent: 'center',
        margin: '32px 0',
        color: colors.fg,
        fontFamily: 'var(--anatomy-font, system-ui), system-ui, sans-serif'
      }}>
      <style>{css}</style>
      <div
        style={{
          position: 'relative',
          width: W,
          height: showHidden ? 2 * H : H,
          transition: 'height 300ms'
        }}>
        <div
          ref={frameRef}
          style={
            {
              position: 'relative',
              width: W,
              height: H,
              borderRadius: 24,
              overflow: showHidden ? 'visible' : 'hidden',
              outline: `2.5px solid ${colors.viewport}`,
              background: colors.page,
              timelineScope: '--sheet-demo'
            } as CSSProperties
          }>
          <FakePage />
          <div
            ref={backdropRef}
            style={
              {
                position: 'absolute',
                inset: 0,
                borderRadius: 24,
                background: 'black',
                opacity: 0.5,
                pointerEvents: 'none',
                animationName: 'sheet-demo-backdrop',
                animationTimingFunction: 'linear',
                animationFillMode: 'both',
                animationTimeline: '--sheet-demo',
                animationRange: 'entry 0% entry 100%'
              } as CSSProperties
            }
          />
          <div
            ref={scrollRef}
            className="sheet-demo-scroller"
            aria-label="Demo sheet. Scroll or swipe down to dismiss."
            tabIndex={0}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: 2 * H,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              scrollSnapType: 'y mandatory',
              borderRadius: showHidden ? 0 : 24,
              outline: 'none'
            }}>
            <div style={{height: H, scrollSnapAlign: 'start'}} />
            <div
              style={{
                height: H,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '0 8px'
              }}>
              <div
                ref={sheetRef}
                style={
                  {
                    height: SHEET_HEIGHT,
                    background: colors.surface,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.2)',
                    padding: '10px 16px',
                    boxSizing: 'border-box',
                    viewTimelineName: '--sheet-demo',
                    viewTimelineAxis: 'block',
                    // Crop the clipped bottom half so the timeline only tracks what is visible.
                    viewTimelineInset: `0px ${H}px`,
                    animationName: 'sheet-demo-radius',
                    animationTimingFunction: 'linear',
                    animationFillMode: 'both',
                    animationTimeline: '--sheet-demo',
                    animationRange: 'entry 0% entry 100%'
                  } as CSSProperties
                }>
                <div
                  style={{
                    width: 36,
                    height: 5,
                    borderRadius: 3,
                    background: colors.grabber,
                    margin: '0 auto 16px'
                  }}
                />
                <div style={{fontWeight: 600, fontSize: 17, marginBottom: 8}}>Sheet</div>
                <div style={{fontSize: 13, color: colors.muted}}>
                  Swipe down to dismiss. Scroll to drag it partway and watch the values change.
                </div>
              </div>
            </div>
            <div style={{height: H, scrollSnapAlign: 'end'}} />
          </div>
          {showHidden && (
            <div
              style={{
                position: 'absolute',
                top: H,
                left: 0,
                width: W,
                height: H,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                border: `1.5px dashed ${colors.line}`,
                background: `repeating-linear-gradient(45deg, color-mix(in srgb, ${colors.page} 70%, transparent) 0 6px, color-mix(in srgb, ${colors.pageLine} 70%, transparent) 6px 8px)`,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: 12,
                textAlign: 'center',
                fontSize: 12,
                color: colors.muted
              }}>
              <span>
                clipped by the overlay,
                <br />
                cropped by <code>view-timeline-inset</code>
              </span>
            </div>
          )}
          {isClosed && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
              <Button onPress={() => scrollTo(H)} style={{pointerEvents: 'auto'}}>
                Open sheet
              </Button>
            </div>
          )}
        </div>
      </div>
      <div style={{width: 300, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14}}>
        <Meter
          label="view-timeline progress"
          value={readout.progress * 100}
          valueLabel={`${Math.round(readout.progress * 100)}%`}
          color={colors.marker}
        />
        <Meter
          label="backdrop opacity"
          value={Number(readout.opacity)}
          maxValue={0.5}
          valueLabel={readout.opacity}
          color={colors.fg}
        />
        <Meter
          label="sheet border-radius"
          value={parseFloat(readout.radius)}
          minValue={8}
          maxValue={24}
          valueLabel={readout.radius}
          color={colors.stage}
        />
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 8,
            background: colors.page,
            fontFamily: mono,
            fontSize: 12,
            lineHeight: 1.5,
            overflowX: 'auto'
          }}>
          {`.sheet {
  view-timeline: --sheet;
  view-timeline-inset: 0 100dvh;
}

.backdrop {
  animation: backdrop linear both;
  animation-timeline: --sheet;
  animation-range: entry;
}`}
        </pre>
        <Checkbox isSelected={showHidden} onChange={setShowHidden}>
          Show the clipped half of the scroller
        </Checkbox>
        {!isSupported && (
          <div style={{fontSize: 13, color: colors.muted}}>
            Your browser doesn’t support scroll-driven animations yet, so the backdrop and corner
            radius won’t animate.
          </div>
        )}
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  minValue = 0,
  maxValue = 100,
  valueLabel,
  color
}: {
  label: string;
  value: number;
  minValue?: number;
  maxValue?: number;
  valueLabel: string;
  color: string;
}) {
  return (
    <AriaMeter value={value} minValue={minValue} maxValue={maxValue} valueLabel={valueLabel}>
      {({percentage, valueText}) => (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
            <Label className="sheet-demo-label" style={{fontFamily: mono, fontSize: 12}}>
              {label}
            </Label>
            <span style={{fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums'}}>
              {valueText}
            </span>
          </div>
          <div
            style={{height: 6, borderRadius: 3, background: colors.pageLine, overflow: 'hidden'}}>
            <div
              style={{height: '100%', width: `${percentage}%`, background: color, borderRadius: 3}}
            />
          </div>
        </>
      )}
    </AriaMeter>
  );
}

function FakePage() {
  return (
    <div aria-hidden style={{padding: 20, display: 'flex', flexDirection: 'column', gap: 10}}>
      <div style={{height: 14, width: '60%', borderRadius: 4, background: colors.pageLine}} />
      {[90, 100, 80, 95, 70].map((w, i) => (
        <div
          key={i}
          style={{height: 8, width: `${w}%`, borderRadius: 4, background: colors.pageLine}}
        />
      ))}
      <div style={{height: 90, borderRadius: 8, background: colors.pageLine, marginTop: 8}} />
    </div>
  );
}
