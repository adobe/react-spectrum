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
  type NavigationTreeItemContentRenderProps,
  type NavigationTreeItemProps as AriaNavigationTreeItemProps,
  type NavigationTreeProps,
  NavigationTreeSection as AriaNavigationTreeSection,
  type NavigationTreeSectionProps
} from 'react-aria-components/NavigationTree';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import './NavigationTree.css';

export function NavigationTree<T>(props: NavigationTreeProps<T>) {
  return <AriaNavigationTree {...props} />;
}

export function NavigationTreeItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaNavigationTreeItemContent>
      {({hasChildItems}: NavigationTreeItemContentRenderProps) => (
        <>
          {props.children}
          <Button
            slot="chevron"
            isDisabled={!hasChildItems}
            style={{visibility: hasChildItems ? undefined : 'hidden'}}>
            <ChevronRight aria-hidden />
          </Button>
        </>
      )}
    </AriaNavigationTreeItemContent>
  );
}

export function NavigationTreeItem(props: AriaNavigationTreeItemProps) {
  return <AriaNavigationTreeItem {...props} />;
}

export function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>) {
  return <AriaNavigationTreeSection {...props} />;
}

export function NavigationTreeHeader(props: NavigationTreeHeaderProps) {
  return <AriaNavigationTreeHeader {...props} />;
}

export function NavigationTreeItemLink(props: LinkProps) {
  return <Link {...props} />;
}
