'use client';
import {
  Button,
  Link,
  type LinkProps,
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
// state is surfaced as a leading-edge indicator (see indicatorStyles) rather than a full-row
// background. The row is a `group` so the indicator can react to the row's data-* attributes. isFocusVisible
// comes from the render props; RAC's isFocusVisible already follows the link (it is not true when
// another child, e.g. a button, is focused).
const itemStyles = tv({
  extend: focusRing,
  base: 'group relative font-sans flex items-center rounded-md cursor-default select-none text-neutral-800 dark:text-neutral-200 -outline-offset-2 [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

const linkStyles = tv({
  base:
    'relative flex-1 min-w-0 flex items-center gap-2 py-1.5 px-2 text-sm no-underline text-current cursor-pointer outline-none ' +
    // A row without an href renders its label as a non-interactive span, so it should not look clickable.
    'group-[:not([data-href])]:cursor-default',
  variants: {
    isDisabled: {
      true: 'cursor-default'
    }
  }
});

// The leading-edge indicator is a real, presentational element (aria-hidden). Its variant is chosen in
// JS (see NavigationTreeItemContent) and surfaced as a single `data-indicator` attribute, so the styles
// stay flat and precedence lives in one place instead of relying on CSS specificity:
//   - current (blue pill): the selected row. Because the variant is picked in JS, it keeps this color
//     even while hovered.
//   - ancestor (neutral dot): a collapsed ancestor of the current route.
//   - hover (neutral pill): any actionable row on hover.
const indicatorStyles = tv({
  base:
    'absolute start-0.5 top-1/2 -translate-y-1/2 w-0.5 h-[1lh] rounded-full forced-color-adjust-none ' +
    // Only real link rows (the group row has data-href) get the hover pill.
    'group-[[data-href]]:data-[indicator=hover]:bg-neutral-400 dark:group-[[data-href]]:data-[indicator=hover]:bg-neutral-500 ' +
    'data-[indicator=current]:bg-blue-600 dark:data-[indicator=current]:bg-blue-400 ' +
    'data-[indicator=ancestor]:h-1 data-[indicator=ancestor]:w-1 data-[indicator=ancestor]:bg-neutral-400 dark:data-[indicator=ancestor]:bg-neutral-500 ' +
    // In forced-colors mode authored backgrounds are dropped, so render any visible state as Highlight.
    'forced-colors:data-[indicator]:bg-[Highlight]'
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

const NavTreeLinkContext = React.createContext<{
  indicator: 'current' | 'ancestor' | undefined;
}>({indicator: undefined});

export function NavigationTreeItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaNavigationTreeItemContent>
      {({level, hasChildItems, isExpanded, isCurrent, isCurrentAncestor}) => {
        let indicator: 'current' | 'ancestor' | undefined;
        if (isCurrent) {
          indicator = 'current';
        } else if (isCurrentAncestor && !isExpanded) {
          indicator = 'ancestor';
        }
        return (
          <>
            {level > 1 && (
              <div
                className="shrink-0"
                style={{width: `calc((${level} - 1) * calc(var(--spacing) * 4))`}}
              />
            )}
            <NavTreeLinkContext.Provider value={{indicator}}>
              {props.children}
            </NavTreeLinkContext.Provider>
            <Button
              slot="chevron"
              isDisabled={!hasChildItems}
              className={({isFocusVisible}) =>
                expandButton({isFocusVisible, className: hasChildItems ? undefined : 'invisible'})
              }>
              <ChevronRight aria-hidden className={chevron({isExpanded})} />
            </Button>
          </>
        );
      }}
    </AriaNavigationTreeItemContent>
  );
}

export function NavigationTreeItem(props: AriaNavigationTreeItemProps) {
  return <AriaNavigationTreeItem className={itemStyles} {...props} />;
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

export interface NavigationTreeItemLinkProps extends Omit<LinkProps, 'children'> {
  children?: React.ReactNode;
}

export function NavigationTreeItemLink(props: NavigationTreeItemLinkProps) {
  let {indicator} = React.useContext(NavTreeLinkContext);
  return (
    <Link {...props} className={({isDisabled}) => linkStyles({isDisabled})}>
      {({isHovered}) => (
        <>
          <span
            aria-hidden
            data-indicator={indicator ?? (isHovered ? 'hover' : undefined)}
            className={indicatorStyles()}
          />
          {props.children}
        </>
      )}
    </Link>
  );
}
