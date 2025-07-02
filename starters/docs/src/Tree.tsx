'use client';
import {
  Button,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  TreeItemContentProps,
  TreeItemContentRenderProps,
  TreeItemProps as AriaTreeItemProps,
  TreeProps
} from 'react-aria-components';

import {MyCheckbox} from './Checkbox';

import './Tree.css';

export function Tree<T extends object>(props: TreeProps<T>) {
  return <AriaTree {...props} />;
}

export function TreeItemContent(
  props: Omit<TreeItemContentProps, 'children'> & { children?: React.ReactNode }
) {
  return (
    (
      <AriaTreeItemContent>
        {(
          { hasChildItems, selectionBehavior, selectionMode, allowsDragging }:
            TreeItemContentRenderProps
        ) => (
          <>
            {allowsDragging && <Button slot="drag">≡</Button>}
            {selectionBehavior === 'toggle' && selectionMode !== 'none' && (
              <MyCheckbox slot="selection" />
            )}
            <Button slot="chevron">
              <svg viewBox="0 0 24 24">
                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Button>
            {props.children}
          </>
        )}
      </AriaTreeItemContent>
    )
  );
}

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title: string;
}

export function TreeItem(props: TreeItemProps) {
  return (
    (
      <AriaTreeItem textValue={props.title} {...props}>
        <TreeItemContent>
          {props.title}
        </TreeItemContent>
        {props.children}
      </AriaTreeItem>
    )
  );
}
