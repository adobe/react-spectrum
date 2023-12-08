import React, {ReactNode} from 'react';

export function Window({children, className = '', isBackground = false, toolbar}) {
  return (
    <div className={`${className} flex flex-col border border-black/10 bg-clip-content border-solid dark:text-white delay-100 duration-700 ease-out overflow-hidden rounded-lg ${isBackground ? 'shadow-lg' : 'shadow-xl'} text-black transition translate-y-0 opacity-100`}>
      <div className="bg-gray-200/80 dark:bg-gray-500/80 backdrop-blur-md border-b border-gray-300 dark:border-gray-500 flex flex-row px-3 pt-2.5 relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
        {toolbar}
        <div className="absolute flex flex-row left-4 top-3.5">
          <div className={`${isBackground ? 'bg-gray-300' : 'bg-red-500'} border border-black/5 h-3 mr-2 rounded-full w-3`} />
          <div className={`${isBackground ? 'bg-gray-300' : 'bg-yellow-500'} border border-black/5 h-3 mr-2 rounded-full w-3`} />
          <div className={`${isBackground ? 'bg-gray-300' : 'bg-green-500'} border border-black/5 h-3 rounded-full w-3`} />
        </div>
      </div>
      {children}
    </div>
  );
}

export function FileTab({children, className = ''}) {
  return <div className={`${className} w-fit border border-gray-300 border-b-gray-50 bg-gray-50 -mb-px rounded-t-md px-3 py-1.5 text-xs text-gray-500 first:ml-20 only:ml-0`}>{children}</div>;
}

export function AddressBar({children}) {
  return <div className="bg-gray-400/40 dark:bg-gray-700/40 px-5 md:px-10 py-1 mx-auto mb-2.5 rounded-md text-slate-500 dark:text-slate-300 text-xs">{children}</div>;
}

export function GradientText({children}) {
  return <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-slate-900 dark:from-slate-100 dark:to-slate-400">{children}</span>;
}

export function Card({className, ...otherProps}) {
  return <div className={`flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 overflow-hidden card-shadow snap-center snap-always ${className}`} {...otherProps} />;
}

export function CardTitle({children}) {
  return <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{children}</h3>;
}

export function CardDescription({children}) {
  return <p className="text-gray-600 dark:text-gray-400 [text-wrap:balance]">{children}</p>;
}

interface ArrowProps {
  href: string,
  children: ReactNode,
  textX: number,
  x1?: number,
  x2?: number,
  points?: string,
  y: number,
  marker?: 'markerStart' | 'markerEnd'
}

export function Arrow({href, children, textX, x1, x2, points, y, marker = 'markerEnd'}: ArrowProps) {
  return (
    <>
      {points
        ? <polyline points={points} {...{[marker]: 'url(#arrow)'}} className="stroke-slate-800 fill-none" />
        : <line x1={x1} y1={y} x2={x2} y2={y} {...{[marker]: 'url(#arrow)'}} className="stroke-slate-800" />
      }
      <a href={href} target="_blank" className="pointer-events-auto outline-none rounded-sm focus:outline-blue-600 outline-offset-2"><text x={textX} y={y + 3} className="text-xs fill-slate-900 underline">{children}</text></a>
    </>
  );
}
