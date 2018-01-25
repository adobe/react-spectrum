import {action, storiesOf} from '@storybook/react';
import {ColumnView, ColumnViewDataSource} from '../src/ColumnView';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('ColumnView', module)
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
    'allowsSelection',
    () => render({allowsSelection: true}),
    {inline: true}
  )
  .addWithInfo(
    'allowsBranchSelection',
    () => render({allowsSelection: true, allowsBranchSelection: true}),
    {inline: true}
  )
  .addWithInfo(
    'renderDetail',
    () => render({renderDetail, allowsSelection: true}),
    {inline: true}
  )
  .addWithInfo(
    'selectedItems',
    () => render({allowsSelection: true, selectedItems: [{label: 'Sub Child 1'}]})
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

class ExampleDS extends ColumnViewDataSource {
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
