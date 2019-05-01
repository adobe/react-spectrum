import {action} from '@storybook/addon-actions';
import Folder from '../src/Icon/Folder';
import Layers from '../src/Icon/Layers';
import React from 'react';
import {storiesOf} from '@storybook/react';
import TreeDataSource from '../src/TreeDataSource';
import {TreeView} from '../src/TreeView';
import './TreeView.styl';

storiesOf('TreeView', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'with icons',
    () => render({icons: true})
  )
  .add(
    'allowsSelection: true',
    () => render({icons: true, allowsSelection: true})
  )
  .add(
    'allowsMultipleSelection: true',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true})
  )
  .add(
    'acceptsDrops: true',
    () => render({icons: true, acceptsDrops: true})
  )
  .add(
    'canDragItems: true',
    () => render({icons: true, canDragItems: true, allowsSelection: true, allowsMultipleSelection: true, acceptsDrops: true})
  )
  .add(
    'selectedItems (controlled)',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, selectedItems: [data[0]]}),
    {inline: true}
  )
  .add(
    'selectedItems using isItemEqual',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, selectedItems: [{label: 'Test 2'}, {label: 'Sub Child 6'}]}),
    {inline: true}
  )
  .add(
    'defaultSelectedItems (uncontrolled)',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, defaultSelectedItems: [{label: 'Test 2'}, {label: 'Sub Child 6'}]}),
    {inline: true}
  )
  .add(
    'disabledItems',
    () => render({allowsSelection: true, allowsMultipleSelection: true, disabledItems: [{label: 'Test 2'}]}),
    {inline: true}
  )
  .add(
    'expandedItems (controlled)',
    () => render({allowsSelection: true, expandedItems: [{label: 'Test 1'}]}),
    {inline: true}
  )
  .add(
    'defaultExpandedItems (uncontrolled)',
    () => render({allowsSelection: true, defaultExpandedItems: [{label: 'Test 1'}]}),
    {inline: true}
  );

const data = [
  {label: 'Test 1', children: [
    {label: 'Child 1', children: [
      {label: 'Sub Child 1'},
      {label: 'Sub Child 2', disabled: true},
      {label: 'Sub Child 3'},
      {label: 'Sub Child 4'},
      {label: 'Sub Child 5'},
      {label: 'Sub Child 6'},
      {label: 'Sub Child 7'},
      {label: 'Sub Child 8'}
    ]},
    {label: 'Child 2'}
  ]},
  {label: 'Test 2'}
];

class ExampleDS extends TreeDataSource {
  async getChildren(item) {
    if (!item) {
      return data;
    }

    return item.children || [];
  }

  hasChildren(item) {
    return !!item.children;
  }

  itemsForDrop(dropTarget, dataTransfer) {
    let files = Array.from(dataTransfer.files);
    if (files.length) {
      return files.map(file => ({label: file.name}));
    }
  }

  isItemEqual(a, b) {
    return a.label === b.label;
  }

  getItemState(item) {
    return {
      isDisabled: item.disabled
    };
  }
}

function renderItem(showIcons, item) {
  // return item.label;
  let icon = item.children ? <Folder size="S" /> : <Layers size="S" />;
  return <span>{showIcons ? icon : null}{item.label}</span>;
}

function render(props = {}) {
  return (
    <TreeView
      dataSource={new ExampleDS}
      renderItem={renderItem.bind(null, props.icons)}
      onSelectionChange={action('selectionChange')}
      onToggleItem={action('toggleItem')}
      {...props} />
  );
}
