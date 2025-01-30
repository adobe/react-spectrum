/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {ArrowRight} from 'lucide-react';
import React, {ForwardedRef, HTMLAttributes, ReactNode} from 'react';

export function Window({children, className = '', isBackground = false, toolbar}) {
  return (
    <div className={`${className} flex flex-col border border-black/10 dark:border-white/20 bg-clip-content border-solid dark:text-white delay-100 duration-700 ease-out overflow-hidden rounded-lg ${isBackground ? 'shadow-lg' : 'shadow-xl'} text-black transition translate-y-0 opacity-100`}>
      <div className="bg-gray-200/80 dark:bg-zinc-700/80 backdrop-blur-md border-b border-gray-300 dark:border-white/10 flex flex-row px-3 relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-none">
        {toolbar}
        <div className="absolute flex flex-row left-4 top-3.5 forced-color-adjust-none">
          <div className={`${isBackground ? 'bg-gray-300 dark:bg-zinc-500' : 'bg-red-500'} border border-black/5 h-3 mr-2 rounded-full w-3`} />
          <div className={`${isBackground ? 'bg-gray-300 dark:bg-zinc-500' : 'bg-yellow-500'} border border-black/5 h-3 mr-2 rounded-full w-3`} />
          <div className={`${isBackground ? 'bg-gray-300 dark:bg-zinc-500' : 'bg-green-500'} border border-black/5 h-3 rounded-full w-3`} />
        </div>
      </div>
      {children}
    </div>
  );
}

export function FileTab({children, className = ''}) {
  return <div className={`${className} w-fit mt-3 border border-b-0 border-gray-300 bg-gray-50 dark:bg-zinc-600 dark:border-white/10 -mb-px rounded-t-md px-3 py-2 text-xs text-gray-500 dark:text-gray-300 first:ml-20 only:ml-0`}>{children}</div>;
}

export function AddressBar({children}) {
  return <div className="bg-gray-400/40 dark:bg-zinc-500/40 px-5 md:px-10 py-1 ml-20 sm:mx-auto my-2.5 rounded-md text-slate-600 dark:text-slate-300 text-xs">{children}</div>;
}

export function GradientText({children}) {
  return <span className="text-transparent bg-clip-text bg-linear-to-b from-slate-600 to-slate-900 dark:from-white dark:to-zinc-400">{children}</span>;
}

export function Card({className, ...otherProps}) {
  return <div className={`flex flex-col bg-white dark:bg-zinc-800/80 dark:backdrop-saturate-200 rounded-2xl p-6 overflow-hidden card-shadow snap-center snap-always ${className}`} {...otherProps} />;
}

export function CardTitle({children}) {
  return <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{children}</h3>;
}

export function CardDescription({children}) {
  return <p className="text-gray-600 dark:text-gray-400 text-base [text-wrap:pretty] [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline">{children}</p>;
}

interface ArrowProps {
  href: string,
  children: ReactNode,
  textX: number,
  x1?: number,
  x2?: number,
  points?: string,
  y: number,
  marker?: 'markerStart' | 'markerEnd' | 'none'
}

export function Arrow({href, children, textX, x1, x2, points, y, marker = 'markerEnd'}: ArrowProps) {
  let markerProps = marker === 'none' ? {} : {...{[marker]: 'url(#arrow)'}};
  return (
    <>
      {points
        ? <polyline points={points} {...markerProps} className="stroke-slate-800 dark:stroke-white fill-none" />
        : <line x1={x1} y1={y} x2={x2} y2={y} {...markerProps} className="stroke-slate-800 dark:stroke-white" />
      }
      <a href={href} target="_blank" className="pointer-events-auto outline-hidden rounded-xs focus:outline-blue-600 dark:focus:outline-blue-500 outline-offset-2"><text x={textX} y={y + 3} className="text-xs fill-slate-900 dark:fill-white underline">{children}</text></a>
    </>
  );
}

export const Finger = React.forwardRef((props: HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement | null>) => {
  return <div ref={ref} className="z-10 pointer-events-none absolute w-10 h-10 rounded-full border border-black/80 bg-black/80 dark:border-white/80 dark:bg-white/80 dark:mix-blend-difference opacity-0 [--hover-opacity:0.15] [--pressed-opacity:0.3] forced-colors:[--hover-opacity:0.5] forced-colors:[--pressed-opacity:1] forced-colors:bg-[Highlight]! forced-colors:mix-blend-normal!" {...props} />;
});

export function LearnMoreLink({href, className}) {
  return <a href={href} className={`group inline-block mt-6 mb-12 text-xl rounded-full px-4 -mx-4 py-1 transition focus-ring active:scale-95 ${className}`}>Learn more<ArrowRight aria-hidden className="inline w-5 h-5 align-middle ml-1 will-change-transform group-hover:translate-x-0.5 transition -mt-1" /></a>;
}

export function Scrollable({children, className = ''}) {
  // eslint-disable-next-line
  return <div tabIndex={0} className={`overflow-x-auto overflow-y-hidden focus-ring -outline-offset-2 ${className}`}>{children}</div>;
}

export function Section({children, className = ''}) {
  return <section className={`px-8 md:px-20 xl:px-36 xl:-mx-16 pb-20 md:pb-56 ${className}`}>{children}</section>;
}
