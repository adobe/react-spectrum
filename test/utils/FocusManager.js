import assert from 'assert';
import FocusManager from '../../src/utils/FocusManager';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';


describe('FocusManager', function () {
  let tree;
  beforeEach(() => {
    tree = mount(
      <FocusManager itemSelector=".item:not(.disabled)">
        <ul>
          <li className="item" tabIndex="-1">Item 1</li>
          <li className="item disabled" tabIndex="-1">Item 2</li>
          <li className="item" tabIndex="-1">Item 3</li>
          <li className="item" tabIndex="-1">Item 4</li>
        </ul>
      </FocusManager>
    );
  });

  it('when ArrowDown key is pressed, focus next not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);

    item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'Down', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'Down', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });

  it('when ArrowDown key is pressed on last item, focus first not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);

    item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'Down', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });

  it('when ArrowUp key is pressed, focus previous not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);

    item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'Up', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'Up', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });

  it('when ArrowUp key is pressed on first item, focus last not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);

    tree.find('.item').at(0);
    item.simulate('keydown', {key: 'Up', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });


  it('when End key is pressed, focus last not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'End', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });

  it('when Home key is pressed, focus first not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'Home', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });

  describe('orientation="horizontal"', () => {
    beforeEach(() => {
      tree.setProps({orientation: 'horizontal'});
    });
    it('when ArrowRight key is pressed with orientation="horizontal", focus next not disabled item', () => {
      let item = tree.find('.item').at(0);
      item.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
      item = tree.find('.item').at(2);
      item.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);

      item = tree.find('.item').at(0);
      item.simulate('keydown', {key: 'Right', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
      item = tree.find('.item').at(2);
      item.simulate('keydown', {key: 'Right', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
    });

    it('when ArrowRight key is pressed on last item, focus first not disabled item', () => {
      let item = tree.find('.item').at(3);
      item.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);

      item = tree.find('.item').at(3);
      item.simulate('keydown', {key: 'Right', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
    });

    it('when ArrowLeft key is pressed, focus previous not disabled item', () => {
      let item = tree.find('.item').at(3);
      item.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
      item = tree.find('.item').at(2);
      item.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);

      item = tree.find('.item').at(3);
      item.simulate('keydown', {key: 'Left', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
      item = tree.find('.item').at(2);
      item.simulate('keydown', {key: 'Left', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
    });

    it('when ArrowLeft key is pressed on first item, focus last not disabled item', () => {
      let item = tree.find('.item').at(0);
      item.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);

      tree.find('.item').at(0);
      item.simulate('keydown', {key: 'Left', preventDefault: () => {}});
      assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
    });
  });

  it('when PageDown/PageUp key is pressed, focus first item on next/previous page', () => {
    const itemHeight = 32;
    const list = tree.find('ul');
    const listNode = list.getDOMNode();
    const items = tree.find('.item');
    let itemNode;
    const stubs = [];
    stubs.push(sinon.stub(listNode, 'clientHeight').get(() => itemHeight * 2));
    stubs.push(sinon.stub(listNode, 'scrollHeight').get(() => itemHeight * items.length));

    items.forEach((item, index) => {
      itemNode = item.getDOMNode();
      stubs.push(sinon.stub(itemNode, 'offsetHeight').get(() => itemHeight));
      stubs.push(sinon.stub(itemNode, 'offsetTop').get(() => itemHeight * index));
    });

    // PageDown
    items.at(0).simulate('keydown', {key: 'PageDown', preventDefault: () => {}});
    assert.equal(items.at(2).getDOMNode(), document.activeElement);
    items.at(2).simulate('keydown', {key: 'PageDown', preventDefault: () => {}});
    assert.equal(items.at(3).getDOMNode(), document.activeElement);

    // PageUp
    items.at(3).simulate('keydown', {key: 'PageUp', preventDefault: () => {}});
    assert.equal(items.at(0).getDOMNode(), document.activeElement);

    // When there is no scrolling
    stubs[0] = stubs[0].get(() => itemHeight * items.length);
    stubs[1] = stubs[1].get(() => itemHeight * items.length);
    items.at(0).simulate('keydown', {key: 'PageDown', preventDefault: () => {}});
    assert.equal(items.at(3).getDOMNode(), document.activeElement);
    items.at(3).simulate('keydown', {key: 'PageUp', preventDefault: () => {}});
    assert.equal(items.at(0).getDOMNode(), document.activeElement);

    stubs.forEach(stub => {
      stub.restore();
      stub.reset();
    });
    tree.unmount();
  });

  describe('onFocus', () => {
    it('should support default manageTabIndex=true when items receive focus', () => {
      let items = tree.find('.item');
      let item = items.at(0);
      item.simulate('focus');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 0 ? 0 : -1);
      });
    });

    it('should not change tabIndex when items receive focus if manageTabIndex=false', () => {
      tree.setProps({manageTabIndex: false});
      let items = tree.find('.item');
      let item = items.at(0);
      item.simulate('focus');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, -1);
      });
    });
  });

  describe('onBlur', () => {
    it('should support default manageTabIndex=true when items lose focus', () => {
      tree.setProps({selectedItemSelector: '.item.selected'});
      let items = tree.find('.item');
      let item = items.at(0);

      // with no item selected
      item.simulate('focus');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 0 ? 0 : -1);
      });
      item.simulate('blur');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 0 ? 0 : -1);
      });

      // with items selected
      item.getDOMNode().classList.add('selected');
      items.at(3).getDOMNode().classList.add('selected');

      // focus a not selected item
      item = items.at(2);
      item.simulate('focus');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 2 ? 0 : -1);
      });

      // on blur from not selected item, all selected items should have tabIndex === 0
      item.simulate('blur');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 0 || index === 3 ? 0 : -1);
      });

      // focus a selected item
      item = items.at(3);
      item.simulate('focus');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 3 ? 0 : -1);
      });

      // on blur from a selected item, just the blurred selected item should have tabIndex === 0
      item.simulate('blur');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, index === 3 ? 0 : -1);
      });
    });

    it('should not change tabIndex when items lose focus if manageTabIndex=false', () => {
      tree.setProps({manageTabIndex: false});
      let items = tree.find('.item');
      let item = items.at(0);
      item.simulate('focus');
      item.simulate('blur');
      items.forEach((item, index) => {
        assert.equal(item.getDOMNode().tabIndex, -1);
      });
    });
  });

  describe('autoFocus', () => {
    it('should set focus the first item by default when component mounts', (done) => {
      tree.setProps({autoFocus: true});
      tree.instance().componentDidMount();
      requestAnimationFrame(() => {
        assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
        done();
      });
    });

    it('should set focus the first selected item when component mounts if selectedItemSelector is defined', (done) => {
      tree.setProps({autoFocus: true, selectedItemSelector: '.item.selected'});
      let item = tree.find('.item').at(2);
      item.getDOMNode().classList.add('selected');
      tree.instance().componentDidMount();
      requestAnimationFrame(() => {
        assert.equal(item.getDOMNode(), document.activeElement);
        item.getDOMNode().classList.remove('selected');
        tree.instance().componentDidMount();
        requestAnimationFrame(() => {
          assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
          done();
        });
      });
    });
  });

  it('should not add event handlers if disabled', () => {
    tree.setProps({disabled: true});
    assert.equal(tree.find('ul').prop('onKeyDown'), null);
    assert.equal(tree.find('ul').prop('onFocus'), null);
    assert.equal(tree.find('ul').prop('onBlur'), null);
  });
});
