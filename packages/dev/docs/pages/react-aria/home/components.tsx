import React from 'react';

export function Window({children, className = '', isBackground = false, toolbar}) {
  return (
    <div className={`${className} flex flex-col border border-black/10 bg-clip-content border-solid dark:bg-gray-900 dark:border-gray-700 dark:text-white delay-100 duration-700 ease-out overflow-hidden rounded-lg ${isBackground ? 'shadow-lg' : 'shadow-xl'} text-black transition translate-y-0 opacity-100`}>
      <div className="bg-gray-200/80 backdrop-blur-md dark:bg-gray-800 border-b border-gray-300 flex flex-row px-3 pt-2.5 relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
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
  return <div className="bg-gray-400/40 dark:bg-gray-700 px-5 md:px-10 py-1 mx-auto mb-2.5 rounded-md text-slate-500 text-xs">{children}</div>;
}
