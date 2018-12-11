import {action, storiesOf} from '@storybook/react';
import {ColumnView} from '../src/ColumnView';
import React from 'react';
import TreeDataSource from '../src/TreeDataSource';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('ColumnView', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({'aria-label': 'Default'}),
    {inline: true}
  )
  .addWithInfo(
    'allowsSelection',
    () => render({allowsSelection: true, 'aria-label': 'allowsSelection'}),
    {inline: true}
  )
  .addWithInfo(
    'allowsBranchSelection',
    () => render({allowsSelection: true, allowsBranchSelection: true, 'aria-label': 'allowsBranchSelection'}),
    {inline: true}
  )
  .addWithInfo(
    'renderDetail',
    () => render({renderDetail, allowsSelection: true, 'aria-label': 'renderDetail'}),
    {inline: true}
  )
  .addWithInfo(
    'selectedItems',
    () => render({allowsSelection: true, selectedItems: [{label: 'Sub Child 1'}], 'aria-label': 'selectedItems'})
  )
  .addWithInfo(
    'navigatedPath',
    () => render({navigatedPath: [data[0], data[0].children[0], data[0].children[0].children[2]]})
  )
  .addWithInfo(
    'navigatedPath using isItemEqual',
    () => render({navigatedPath: [{label: 'Test 1'}, {label: 'Child 1'}, {label: 'Sub Child 2'}]})
  );

const data = [
  {label: 'Test 1', children: [
    {label: 'Child 1', children: [
      {label: 'Sub Child 1'},
      {label: 'Sub Child 2'},
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

    return item.children;
  }

  hasChildren(item) {
    return !!item.children;
  }

  isItemEqual(a, b) {
    return a.label === b.label;
  }
}

function renderItem(item) {
  return item.label;
}

function renderDetail(item) {
  return (
    <div>
      <h4>Detail</h4>
      <div>{item.label}</div>
    </div>
  );
}

function render(props = {}) {
  return (
    <ColumnView
      dataSource={new ExampleDS}
      renderItem={renderItem}
      onNavigate={action('navigate')}
      onSelectionChange={action('selectionChange')}
      {...props} />
  );
}
