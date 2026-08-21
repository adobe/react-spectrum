'use client';
import {
  Button,
  Link,
  NavigationTree as AriaNavigationTree,
  NavigationTreeHeader as AriaNavigationTreeHeader,
  type NavigationTreeHeaderProps,
  NavigationTreeItem as AriaNavigationTreeItem,
  NavigationTreeItemContent as AriaNavigationTreeItemContent,
  type NavigationTreeItemProps as AriaNavigationTreeItemProps,
  type NavigationTreeProps,
  NavigationTreeSection as AriaNavigationTreeSection,
  type NavigationTreeSectionProps
} from 'react-aria-components/NavigationTree';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import {tv} from 'tailwind-variants';
import {composeTailwindRenderProps, focusRing} from './utils';

export function NavigationTree<T>({children, ...props}: NavigationTreeProps<T>) {
  return (
    <AriaNavigationTree
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'w-56 max-w-full max-h-72 overflow-auto flex flex-col p-1 gap-0.5 relative border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 outline-none'
      )}>
      {children}
    </AriaNavigationTree>
  );
}

// The focus ring lives on the row (not the link) so it spans the whole item. Hover/current/ancestor
// state is surfaced as a leading-edge indicator on the Link (see linkStyles) rather than a full-row
// background. The row is a `group` so the Link can react to the row's data-* attributes. isFocusVisible
// comes from the render props; RAC's isFocusVisible already follows the link (it is not true when
// another child, e.g. a button, is focused).
const itemStyles = tv({
  extend: focusRing,
  base: 'group relative font-sans flex items-center rounded-md cursor-default select-none text-neutral-800 dark:text-neutral-200 -outline-offset-2',
  variants: {
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

// A single `before` pseudo-element on the Link is the leading-edge indicator; the row's data-*
// attributes (via `group-[...]`) decide how it looks so the three states never overlap:
//   - Hover pill (neutral, full height): only rows that render as a link (`data-href`) light up on
//     hover, matching RAC's data-hovered on actionable rows.
//   - Current pill (blue, full height): the selected row, but only when it is not also hovered, so
//     hovering the selected row shows the neutral hover pill instead (never both).
//   - Ancestor dot (neutral, short): a collapsed ancestor of the current route shows a small dot in
//     the same spot. It shortens the height (higher specificity than the base) and shares the neutral
//     color with hover, so hovering a collapsed ancestor still reads as the dot, not a full pill.
// Works for ancestors that render as a link or a plain span since it keys off the row, not the element.
const linkStyles = tv({
  base:
    'relative flex-1 min-w-0 flex items-center gap-2 py-1.5 px-2 text-sm no-underline text-current cursor-pointer outline-none ' +
    // A row without an href renders its label as a non-interactive span, so it should not look clickable.
    'group-[:not([data-href])]:cursor-default ' +
    "before:content-[''] before:absolute before:start-0.5 before:top-1/2 before:h-[1lh] before:w-1 before:-translate-y-1/2 before:rounded-full before:forced-color-adjust-none " +
    'group-[[data-hovered][data-href]]:before:bg-neutral-400 dark:group-[[data-hovered][data-href]]:before:bg-neutral-500 ' +
    'group-[[data-current]:not([data-hovered])]:before:bg-blue-600 dark:group-[[data-current]:not([data-hovered])]:before:bg-blue-400 ' +
    'group-[[data-current-ancestor]:not([data-expanded])]:before:h-1 group-[[data-current-ancestor]:not([data-expanded])]:before:bg-neutral-400 dark:group-[[data-current-ancestor]:not([data-expanded])]:before:bg-neutral-500 ' +
    // In forced-colors mode authored backgrounds are dropped, so whenever the indicator is showing
    // (any of the three states above) render it as the system Highlight color instead.
    'forced-colors:group-[:is([data-hovered][data-href],[data-current]:not([data-hovered]),[data-current-ancestor]:not([data-expanded]))]:before:bg-[Highlight]',
  variants: {
    isDisabled: {
      true: 'cursor-default'
    }
  }
});

const expandButton = tv({
  extend: focusRing,
  base: 'shrink-0 w-6 h-6 flex items-center justify-center rounded-md border-0 p-0 bg-transparent cursor-default [-webkit-tap-highlight-color:transparent] -outline-offset-2'
});

const chevron = tv({
  base: 'w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ease-in-out',
  variants: {
    isExpanded: {
      true: 'rotate-90'
    }
  }
});

export function NavigationTreeItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaNavigationTreeItemContent>
      {({level, hasChildItems, isDisabled, isExpanded}) => (
        <>
          {level > 1 && (
            <div
              className="shrink-0"
              style={{width: `calc((${level} - 1) * calc(var(--spacing) * 4))`}}
            />
          )}
          <Link className={linkStyles({isDisabled})}>{props.children}</Link>
          {hasChildItems && (
            <Button slot="chevron" className={({isFocusVisible}) => expandButton({isFocusVisible})}>
              <ChevronRight aria-hidden className={chevron({isExpanded})} />
            </Button>
          )}
        </>
      )}
    </AriaNavigationTreeItemContent>
  );
}

export interface NavigationTreeItemProps extends Partial<AriaNavigationTreeItemProps> {
  title?: React.ReactNode;
}

export function NavigationTreeItem(props: NavigationTreeItemProps) {
  let textValue = typeof props.title === 'string' ? props.title : '';
  return (
    <AriaNavigationTreeItem className={itemStyles} textValue={textValue} {...props}>
      <NavigationTreeItemContent>{props.title}</NavigationTreeItemContent>
      {props.children}
    </AriaNavigationTreeItem>
  );
}

export function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>) {
  return <AriaNavigationTreeSection {...props} className="not-first:mt-4" />;
}

export function NavigationTreeHeader(props: NavigationTreeHeaderProps) {
  return (
    <AriaNavigationTreeHeader
      {...props}
      className="px-2 py-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
    />
  );
}
