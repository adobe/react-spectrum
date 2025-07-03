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
import {ChevronRight} from 'lucide-react';

import {Checkbox} from './Checkbox';

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
          { selectionBehavior, selectionMode, allowsDragging }:
            TreeItemContentRenderProps
        ) => (
          <>
            {allowsDragging && <Button slot="drag">≡</Button>}
            {selectionBehavior === 'toggle' && selectionMode !== 'none' && (
              <Checkbox slot="selection" />
            )}
            <Button slot="chevron">
              <ChevronRight />
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
