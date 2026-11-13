/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Button,
  Checkbox,
  Collection,
  GridList,
  GridListItem,
  ListBox,
  ListBoxItem,
  ListLayout,
  Selection,
  Text,
  Tree,
  TreeItem,
  TreeItemContent,
  Virtualizer
} from 'react-aria-components';
import React, {useState} from 'react';

interface RecordItem {
  id: string;
  name: string;
  description: string;
}

export function VariableFixture({items}: {items: RecordItem[]}) {
  let [narrow, setNarrow] = useState(false);
  return (
    <>
      <Button id="variable-resize" onPress={() => setNarrow(true)}>
        Open side panel
      </Button>
      <Virtualizer
        layout={ListLayout}
        layoutOptions={{estimatedRowHeight: 80}}
        shouldObserveItemSize>
        <ListBox
          id="variable-list"
          aria-label="Project descriptions"
          className="variable-list"
          style={{width: narrow ? 360 : 600}}
          items={items}>
          {item => (
            <ListBoxItem id={item.id} data-record={item.id} textValue={item.name}>
              <Text slot="label">{item.name}</Text>
              <Text slot="description">{item.description}</Text>
            </ListBoxItem>
          )}
        </ListBox>
      </Virtualizer>
    </>
  );
}

export function MutationFixture({
  items,
  nextPage,
  replacement
}: {
  items: RecordItem[];
  nextPage: RecordItem[];
  replacement: RecordItem[];
}) {
  let [rows, setRows] = useState(items);
  let [selected, setSelected] = useState<Selection>(new Set());
  let remove = () => {
    setRows(rows => rows.filter(row => selected !== 'all' && !selected.has(row.id)));
    setSelected(new Set());
  };
  return (
    <>
      <div className="collection-toolbar">
        <Button
          id="collection-append"
          onPress={() => setRows(rows => [...rows, ...nextPage])}
          isDisabled={rows.some(row => row.id === nextPage[0].id)}>
          Load more
        </Button>
        <Button id="collection-remove" onPress={remove}>
          Delete selected
        </Button>
        <Button
          id="collection-replace"
          onPress={() => {
            setRows(replacement);
            setSelected(new Set());
          }}>
          Switch project
        </Button>
      </div>
      <div
        onKeyDownCapture={event => {
          if (event.key === 'Delete') {
            event.preventDefault();
            remove();
          }
        }}>
        <GridList
          aria-label="Project records"
          className="mutation-list"
          items={rows}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}>
          {item => (
            <GridListItem id={item.id} data-record={item.id} textValue={item.name}>
              <div className="mutation-content">
                <Checkbox slot="selection" aria-label={`Select ${item.name}`}>
                  <span className="check" />
                </Checkbox>
                <Text data-record-label>{item.name}</Text>
                <Text slot="description">{item.description}</Text>
              </div>
            </GridListItem>
          )}
        </GridList>
      </div>
    </>
  );
}

export interface ProjectNode {
  id: string;
  name: string;
  children?: ProjectNode[];
}

function ProjectItem({node}: {node: ProjectNode}) {
  return (
    <TreeItem id={node.id} textValue={node.name} data-record={node.id}>
      <TreeItemContent>
        {({hasChildItems, isExpanded, level}) => (
          <div className="tree-content" style={{paddingInlineStart: (level - 1) * 24}}>
            {hasChildItems && (
              <Button slot="chevron" aria-label={`Toggle ${node.name}`}>
                {isExpanded ? '▾' : '▸'}
              </Button>
            )}
            <Text slot="label">{node.name}</Text>
          </div>
        )}
      </TreeItemContent>
      <Collection items={node.children}>{child => <ProjectItem node={child} />}</Collection>
    </TreeItem>
  );
}

export function TreeFixture({items}: {items: ProjectNode[]}) {
  return (
    <Tree aria-label="Project files" className="project-tree" items={items}>
      {node => <ProjectItem node={node} />}
    </Tree>
  );
}
