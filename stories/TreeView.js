import {action, storiesOf} from '@storybook/react';
import Folder from '../src/Icon/Folder';
import Layers from '../src/Icon/Layers';
import React from 'react';
import TreeDataSource from '../src/TreeDataSource';
import {TreeView} from '../src/TreeView';
import {VerticalCenter} from '../.storybook/layout';
import './TreeView.styl';

storiesOf('TreeView', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'with icons',
    () => render({icons: true}),
    {inline: true}
  )
  .addWithInfo(
    'allowsSelection: true',
    () => render({icons: true, allowsSelection: true}),
    {inline: true}
  )
  .addWithInfo(
    'allowsMultipleSelection: true',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true}),
    {inline: true}
  )
  .addWithInfo(
    'acceptsDrops: true',
    () => render({icons: true, acceptsDrops: true}),
    {inline: true}
  )
  .addWithInfo(
    'canDragItems: true',
    () => render({icons: true, canDragItems: true, allowsSelection: true, allowsMultipleSelection: true, acceptsDrops: true}),
    {inline: true}
  )
  .addWithInfo(
    'selectedItems (controlled)',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, selectedItems: [data[0]]}),
    {inline: true}
  )
  .addWithInfo(
    'selectedItems using isItemEqual',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, selectedItems: [{label: 'Test 2'}, {label: 'Sub Child 6'}]}),
    {inline: true}
  )
  .addWithInfo(
    'defaultSelectedItems (controlled)',
    () => render({icons: true, allowsSelection: true, allowsMultipleSelection: true, defaultSelectedItems: [{label: 'Test 2'}, {label: 'Sub Child 6'}]}),
    {inline: true}
  )
  .addWithInfo(
    'disabledItems',
    () => render({allowsSelection: true, allowsMultipleSelection: true, disabledItems: [{label: 'Test 2'}]}),
    {inline: true}
  )
  .addWithInfo(
    'expandedItems (controlled)',
    () => render({allowsSelection: true, expandedItems: [{label: 'Test 1'}]}),
    {inline: true}
  )
  .addWithInfo(
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
