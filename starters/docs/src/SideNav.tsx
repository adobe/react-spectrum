'use client';
import {
  Button,
  Link,
  SideNav as AriaSideNav,
  SideNavHeader as AriaSideNavHeader,
  type SideNavHeaderProps,
  SideNavItem as AriaSideNavItem,
  SideNavItemContent as AriaSideNavItemContent,
  type SideNavItemContentRenderProps,
  type SideNavItemProps as AriaSideNavItemProps,
  type SideNavProps,
  SideNavSection as AriaSideNavSection,
  type SideNavSectionProps
} from 'react-aria-components/SideNav';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import './SideNav.css';

export function SideNav<T>(props: SideNavProps<T>) {
  return <AriaSideNav {...props} />;
}

export function SideNavItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaSideNavItemContent>
      {({hasChildItems}: SideNavItemContentRenderProps) => (
        <>
          {/* The label is rendered as a Link so it becomes the row's focusable child. It picks up
           * href + aria-current automatically from the SideNav. Rows without an href render as a
           * span instead of an anchor. */}
          <Link>{props.children}</Link>
          {hasChildItems && (
            <Button slot="chevron">
              <ChevronRight aria-hidden />
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
  let textValue = typeof props.title === 'string' ? props.title : '';
  return (
    <AriaSideNavItem textValue={textValue} {...props}>
      {props.title != null ? (
        <>
          <SideNavItemContent>{props.title}</SideNavItemContent>
          {props.children}
        </>
      ) : (
        props.children
      )}
    </AriaSideNavItem>
  );
}

export function SideNavSection<T>(props: SideNavSectionProps<T>) {
  return <AriaSideNavSection {...props} />;
}

export function SideNavHeader(props: SideNavHeaderProps) {
  return <AriaSideNavHeader {...props} />;
}
