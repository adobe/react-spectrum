import assert from 'assert';
import Column from '../../src/ColumnView/js/Column';
import {ColumnView} from '../../src/ColumnView';
import {data, renderItem, TestDS} from './utils';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('ColumnView', () => {
  let ds = new TestDS;

  it('passes default props to Column', () => {
    const tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} />, {disableLifecycleMethods: true});
    assert(tree.hasClass('spectrum-MillerColumns'));
    let col = tree.find(Column);

    assert.equal(col.length, 1);
    assert.equal(tree.find(Column).prop('allowsSelection'), false);
    assert.equal(tree.find(Column).prop('allowsBranchSelection'), false);
  });

  it('renders a detail column', async () => {
    let renderDetail = sinon.spy();
    const tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} renderDetail={renderDetail} />, {disableLifecycleMethods: true});
    assert(!renderDetail.called);

    await ds.navigateToItem(data[1]);
    assert(tree.find(Column));
    assert(tree.find('.spectrum-MillerColumns-item'));
    assert(renderDetail.calledOnce);
    await ds.navigateToItem(null);
  });

  it('calls the selectionChange prop', async () => {
    let onSelectionChange = sinon.spy();
    shallow(<ColumnView dataSource={ds} renderItem={renderItem} onSelectionChange={onSelectionChange} />, {disableLifecycleMethods: true});

    await ds.setSelected([data[1]]);
    assert(onSelectionChange.calledOnce);
  });

  it.skip('calls the onNavigate prop', async () => {
    let onNavigate = sinon.spy();
    let wrapper = mount(<ColumnView dataSource={ds} renderItem={renderItem} onNavigate={onNavigate} />);

    // Navigate to the first column then the 2nd
    await ds.navigateToItem(data[0]);
    await ds.navigateToItem(data[0].children[0]);
    await sleep(50);
    let cols = wrapper.find(Column).at(1).getDOMNode();
    assert.deepEqual(cols, document.activeElement);

    assert(onNavigate.calledTwice);
    assert.deepEqual(onNavigate.getCall(0).args[0], [data[0]]);
    let instance = wrapper.instance();
    wrapper.unmount();
    assert.equal(instance.mounted, false);
  });

  it('should set the selected items if passed', async () => {
    class Test extends TestDS {
      isItemEqual(a, b) {
        return a.label === b.label;
      }
    }

    let ds = new Test;

    shallow(<ColumnView dataSource={ds} renderItem={renderItem} selectedItems={[{label: 'Child 1'}]} />, {disableLifecycleMethods: true});
    assert.equal(ds.isSelected({label: 'Child 1'}), true);
  });
});
