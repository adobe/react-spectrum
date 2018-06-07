import assert from 'assert';
import {mount, shallow} from 'enzyme';
import Popover from '../../src/Popover';
import React from 'react';
import sinon from 'sinon';

describe('Popover', () => {
  it('supports different variants', () => {
    const tree = shallow(<Popover variant="info" />);
    assert.equal(tree.hasClass('spectrum-Dialog--info'), true);
  });

  it('supports onKeyDown event handler', () => {
    const onKeyDown = sinon.spy();
    const tree = shallow(<Popover onKeyDown={onKeyDown} />);
    tree.simulate('keydown', {key: 'Tab', shiftKey: false});
    assert(onKeyDown.called);
  });

  it('supports onFocus event handler', () => {
    const onFocus = sinon.spy();
    const tree = shallow(<Popover onFocus={onFocus} trapFocus={false} />);
    tree.simulate('focus');
    assert(onFocus.called);
  });

  it('supports trapFocus', () => {
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();
    const tree = mount(<Popover trapFocus>
      <button>First</button>
      <button>Last</button>
    </Popover>);
    const event = {
      preventDefault,
      stopPropagation
    };
    assert.equal(tree.childAt(0).prop('tabIndex'), 1);
    tree.simulate('focus', event);
    assert(preventDefault.called);
    assert(stopPropagation.called);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());
    event.key = 'Tab';
    event.shiftKey = true;
    tree.find('button').first().simulate('keydown', event);
    assert(preventDefault.calledTwice);
    assert(stopPropagation.calledTwice);
    assert.equal(document.activeElement, tree.find('button').last().getDOMNode());
    event.shiftKey = false;
    tree.find('button').last().simulate('keydown', event);
    assert(preventDefault.calledThrice);
    assert(stopPropagation.calledThrice);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());
    tree.unmount();
  });

  // it('supports different variants', () => {
  //   const tree = shallow(<Popover variant="info" />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.hasClass('spectrum-Dialog--info'), true);
  // });

  // it('supports optional title', () => {
  //   const tree = shallow(<Popover />);
  //   let header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(!header.node);
  //   tree.setProps({title: 'Foo'});
  //   header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(header.node);
  //   assert.equal(header.prop('title'), 'Foo');
  // });

  // it('supports additional classNames', () => {
  //   const tree = shallow(<Popover className="foo" />);
  //   assert.equal(tree.hasClass('foo'), true);
  // });

  // it('supports additional properties', () => {
  //   const tree = shallow(<Popover foo />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.prop('foo'), true);
  // });
});
