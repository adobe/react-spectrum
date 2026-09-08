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

import {BoxChangeEvent, DOMBox, DOMBoxAnchor, DOMResizableBox} from '../../src/utils/layout';
import {Meta} from '@storybook/react';
import React, {useEffect, useRef, useState} from 'react';

const MODELS = ['margin-box', 'border-box', 'padding-box', 'content-box'] as const;
const COLORS = ['orange', 'red', 'green', 'blue'];

export default {
  title: 'DOMBox'
} as Meta;

function Outline({rect, color}: {rect: DOMRect | null; color: string}) {
  if (rect == null) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        outline: `2px dashed ${color}`,
        pointerEvents: 'none'
      }}
    />
  );
}

function useBoxChange(create: (element: HTMLElement) => DOMResizableBox<HTMLElement>) {
  let ref = useRef<HTMLDivElement>(null);
  let [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let box = create(ref.current!);
    let onChange = (e: BoxChangeEvent) => setRect(e.boundingRect);
    box.addEventListener('react-aria-boxchange', onChange);
    setRect(box.boundingRect);
    return () => box.removeEventListener('react-aria-boxchange', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, rect] as const;
}

export function ElementBox() {
  let ref = useRef<HTMLDivElement>(null);
  let [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    setRects(MODELS.map(model => new DOMBox(ref.current!, {model}).boundingRect));
  }, []);

  return (
    <>
      <div
        ref={ref}
        style={{
          width: 200,
          height: 100,
          margin: 30,
          padding: 20,
          border: '10px solid #468',
          overflow: 'auto'
        }}>
        Orange margin, red border, green padding, blue content. The gutter is carved from the
        padding box.
      </div>
      {rects.map((rect, i) => (
        <Outline key={MODELS[i]} rect={rect} color={COLORS[i]} />
      ))}
    </>
  );
}

export function DocumentBox() {
  let ref = useRef<HTMLIFrameElement>(null);
  let [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    let frame = ref.current!;
    let onLoad = () => {
      let doc = frame.contentDocument!;
      doc.body.style.height = '200vh';
      setRects([
        new DOMBox(doc, {model: 'border-box'}).boundingRect,
        new DOMBox(doc, {model: 'padding-box'}).boundingRect
      ]);
    };
    frame.addEventListener('load', onLoad);
    frame.src = 'about:blank';
    return () => frame.removeEventListener('load', onLoad);
  }, []);

  // Rects are in the iframes coordinate space; the overlay layer covers the frame exactly
  // so they draw in place.
  return (
    <div style={{position: 'relative'}}>
      <iframe
        ref={ref}
        title="document"
        style={{width: 400, height: 240, border: 0, display: 'block'}}
      />
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {rects.map((rect, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              outline: `2px dashed ${['red', 'green', 'blue'][i]}`,
              outlineOffset: -2 - 2 * i
            }}
          />
        ))}
      </div>
      <p>Red border box (ICB), green padding box (minus the scrollbar gutter)</p>
    </div>
  );
}

export function ResizableBox() {
  let [ref, rect] = useBoxChange(el => new DOMResizableBox(el, {model: 'content-box'}));

  return (
    <>
      <div
        ref={ref}
        style={{
          width: 200,
          height: 120,
          padding: 16,
          border: '6px solid #468',
          resize: 'both',
          overflow: 'auto'
        }}>
        Drag the corner. The outline is the content box and follows size, not position.
      </div>
      <Outline rect={rect} color="green" />
    </>
  );
}

export function BoxAnchor() {
  let [ref, rect] = useBoxChange(el => new DOMBoxAnchor(el, {model: 'border-box'}));
  let [transformed, setTransformed] = useState(false);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={transformed}
          onChange={e => setTransformed(e.target.checked)}
        />{' '}
        Animate transform
      </label>
      <div style={{height: 120, overflow: 'auto', border: '1px solid #ccc'}}>
        <div style={{height: 400, padding: 40}}>
          <div
            ref={ref}
            style={{
              width: 140,
              height: 60,
              background: '#e77',
              transition: 'transform 1s',
              transform: transformed ? 'translate(120px, 20px) rotate(15deg) scale(1.3)' : 'none'
            }}>
            Scroll here or the page. The outline follows position and size.
          </div>
        </div>
      </div>
      <div style={{height: '150vh'}} />
      <Outline rect={rect} color="purple" />
    </>
  );
}

export function Transform() {
  let ref = useRef<HTMLDivElement>(null);
  let [amount, setAmount] = useState(0);
  let [kept, setKept] = useState<DOMRect | null>(null);
  let [stripped, setStripped] = useState<DOMRect | null>(null);

  useEffect(() => {
    let el = ref.current!;
    setKept(new DOMBox(el, {transform: true}).boundingRect);
    setStripped(new DOMBox(el, {transform: false}).boundingRect);
  }, [amount]);

  return (
    <>
      <label>
        Transform{' '}
        <input
          type="range"
          min={0}
          max={100}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />
      </label>
      <div
        style={{
          transform: 'scale(1.5)',
          transformOrigin: '0 0',
          width: 220,
          padding: 10,
          margin: 20,
          background: '#eef'
        }}>
        <div
          ref={ref}
          style={{
            width: 100,
            height: 60,
            margin: 12,
            background: '#43614f',
            transformOrigin: '30% 70%',
            transform: `translate(${amount * 0.6}px, 0) rotate(${amount * 0.5}deg) scale(${1 - amount * 0.004})`
          }}>
          Green keeps the transform, purple strips it.
        </div>
      </div>
      <Outline rect={kept} color="green" />
      <Outline rect={stripped} color="purple" />
    </>
  );
}
