'use client';
import {
  Button,
  Link,
  SideNav as AriaSideNav,
  SideNavHeader as AriaSideNavHeader,
  type SideNavHeaderProps,
  SideNavItem as AriaSideNavItem,
  SideNavItemContent as AriaSideNavItemContent,
  type SideNavItemProps as AriaSideNavItemProps,
  type SideNavProps,
  SideNavSection as AriaSideNavSection,
  type SideNavSectionProps
} from 'react-aria-components/SideNav';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import {tv} from 'tailwind-variants';
import {composeTailwindRenderProps, focusRing} from './utils';

export function SideNav<T>({children, ...props}: SideNavProps<T>) {
  return (
    <AriaSideNav
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'w-56 max-w-full max-h-72 overflow-auto flex flex-col p-1 gap-0.5 relative border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 outline-hidden'
      )}>
      {children}
    </AriaSideNav>
  );
}

// Selection background and the focus ring live on the row (not the link) so they span the whole
// item. isCurrent and isFocusVisible come from the SideNavItem render props; RAC's isFocusVisible
// already follows the link (it is not true when another child, e.g. a button, is focused).
const itemStyles = tv({
  extend: focusRing,
  base: 'relative font-sans flex items-center rounded-md cursor-default select-none text-neutral-800 dark:text-neutral-200 -outline-offset-2',
  variants: {
    isHovered: {
      true: 'bg-neutral-100 dark:bg-neutral-800'
    },
    isCurrent: {
      true: 'font-semibold bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

const linkStyles = tv({
  base: 'flex-1 min-w-0 flex items-center gap-2 py-1.5 px-2 text-sm no-underline text-current cursor-pointer outline-hidden',
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

export function SideNavItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaSideNavItemContent>
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
    </AriaSideNavItemContent>
  );
}

export interface SideNavItemProps extends Partial<AriaSideNavItemProps> {
  title?: React.ReactNode;
}

export function SideNavItem(props: SideNavItemProps) {
  return (
    <AriaSideNavItem className={itemStyles} textValue={props.title} {...props}>
      <SideNavItemContent>{props.title}</SideNavItemContent>
      {props.children}
    </AriaSideNavItem>
  );
}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return <AriaSideNavSection {...props} className="not-first:mt-4" />;
}

export function SideNavHeader(props: SideNavHeaderProps) {
  return (
    <AriaSideNavHeader
      {...props}
      className="px-2 py-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
    />
  );
}
