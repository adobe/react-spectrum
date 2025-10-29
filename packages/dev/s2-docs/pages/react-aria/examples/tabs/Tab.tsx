import {Tab as RACTab, SelectionIndicator, TabProps, composeRenderProps} from 'react-aria-components';
import {tv} from 'tailwind-variants';
import {focusRing} from 'tailwind-starter/utils';
import {CSSProperties} from 'react';

const tabProps = tv({
  extend: focusRing,
  base: 'relative flex items-center cursor-default rounded-full px-3 py-1.5 text-sm text-gray-900 dark:text-zinc-100 font-medium transition forced-color-adjust-none',
  variants: {
    isDisabled: {
      true: 'text-gray-200 dark:text-zinc-600 forced-colors:text-[GrayText] selected:text-gray-300 dark:selected:text-zinc-500 forced-colors:selected:text-[HighlightText] selected:bg-gray-200 dark:selected:bg-zinc-600 forced-colors:selected:bg-[GrayText]'
    }
  }
});

export function Tab(props: TabProps) {
  return (
    <RACTab
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabProps({...renderProps, className: (className || '') + ' tab'})
      )}
      style={{anchorName: `--tab-${props.id}`} as CSSProperties}>
      {composeRenderProps(props.children, children => (<>
        {children}
        {/* Graceful fallback in case scroll-timeline is not supported (e.g. Firefox). */}
        <SelectionIndicator className="absolute top-0 left-0 w-full h-full z-10 bg-white rounded-full mix-blend-difference motion-safe:transition-[translate,width,height] supports-animation-timeline:hidden" />
      </>))}
    </RACTab>
  );
}
