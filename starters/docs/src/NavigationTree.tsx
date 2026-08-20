'use client';
import {
  Button,
  Link,
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
          {/* The label is rendered as a Link so it becomes the row's focusable child. It picks up
           * href + aria-current automatically from the NavigationTree. Rows without an href render as a
           * span instead of an anchor. */}
          <Link>{props.children}</Link>
          {hasChildItems && (
            <Button slot="chevron">
              <ChevronRight aria-hidden />
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
    <AriaNavigationTreeItem textValue={textValue} {...props}>
      {props.title != null ? (
        <>
          <NavigationTreeItemContent>{props.title}</NavigationTreeItemContent>
          {props.children}
        </>
      ) : (
        props.children
      )}
    </AriaNavigationTreeItem>
  );
}

export function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>) {
  return <AriaNavigationTreeSection {...props} />;
}

export function NavigationTreeHeader(props: NavigationTreeHeaderProps) {
  return <AriaNavigationTreeHeader {...props} />;
}
