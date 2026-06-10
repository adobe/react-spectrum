'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useBreadcrumbs,
  useBreadcrumbItem,
  type AriaBreadcrumbsProps,
  type AriaBreadcrumbItemProps
} from 'react-aria/useBreadcrumbs';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {ChevronRight} from 'lucide-react';
import {Children, cloneElement, isValidElement, useRef} from 'react';
import type {ReactElement, ReactNode} from 'react';
import './Breadcrumbs.css';
import './Link.css';

export function Breadcrumbs(props: AriaBreadcrumbsProps & {children?: ReactNode}) {
  // useBreadcrumbs provides the navigation landmark for the list.
  let {navProps} = useBreadcrumbs(props);
  let childCount = Children.count(props.children);

  return (
    <nav {...navProps}>
      <ol className="react-aria-Breadcrumbs">
        {/* Mark the last item as the current page. */}
        {Children.map(props.children, (child, i) =>
          isValidElement(child)
            ? cloneElement(child as ReactElement<any>, {isCurrent: i === childCount - 1})
            : child
        )}
      </ol>
    </nav>
  );
}

export function Breadcrumb(props: AriaBreadcrumbItemProps & {href?: string; children?: ReactNode}) {
  let ref = useRef<HTMLAnchorElement>(null);
  let {itemProps} = useBreadcrumbItem({...props, elementType: 'a'}, ref);
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <li className="react-aria-Breadcrumb">
      <a
        {...mergeProps(itemProps, hoverProps, focusProps)}
        ref={ref}
        href={props.isCurrent ? undefined : props.href}
        className="react-aria-Link"
        data-hovered={isHovered || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-current={props.isCurrent || undefined}
        data-disabled={props.isDisabled || undefined}>
        {props.children}
      </a>
      {!props.isCurrent && <ChevronRight size={14} />}
    </li>
  );
}
