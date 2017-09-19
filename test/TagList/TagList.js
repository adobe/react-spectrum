import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Tag, TagList} from '../../src/TagList';

describe('TagList', () => {
  it('has correct classname when disabled', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(tree.hasClass('is-disabled'), true);
  });

  it('has coral class', () => {
    const tree = shallow(<TagList />);
    assert.equal(tree.hasClass('spectrum-TagList'), true);
  });

  it('passes in a custom class', () => {
    const tree = shallow(<TagList className="squid" />);
    assert.equal(tree.hasClass('squid'), true);
  });

  it('sets the role', () => {
    const tree = shallow(<TagList />);
    assert.equal(tree.prop('role'), 'listbox');
  });

  it('sets the name', () => {
    const tree = shallow(<TagList name="Friendly" />);
    assert.equal(tree.prop('name'), 'Friendly');
  });

  it('sets the aria-disabled', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(tree.prop('aria-disabled'), true);
  });

  it('sets the aria-invalid', () => {
    const tree = shallow(<TagList invalid />);
    assert.equal(tree.prop('aria-invalid'), true);
  });

  it('sets readOnly', () => {
    const tree = shallow(<TagList readOnly />);
    assert.equal(tree.prop('readOnly'), true);
  });

  it('sets the aria-required', () => {
    const tree = shallow(<TagList required />);
    assert.equal(tree.prop('aria-required'), true);
  });

  it('sets disabled on the element', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(tree.prop('disabled'), true);
  });

  it('sets focused state when onFocus', () => {
    const spy = sinon.spy();
    const tree = shallow(<TagList onFocus={spy} />);
    assert.equal(tree.state('focused'), false);
    tree.simulate('focus');
    assert(spy.called);
    assert.equal(tree.state('focused'), true);
  });

  it('removes focused state when onBlur', () => {
    const spy = sinon.spy();
    const tree = shallow(<TagList onBlur={spy} />).setState({focused: true});
    tree.simulate('blur');
    assert(spy.called);
    assert.equal(tree.state('focused'), false);
  });

  describe('Children', () => {
    let tree;
    let child1;
    let child2;

    function run(props = {}, state = {}) {
      tree = shallow(
        <TagList {...props}>
          <Tag className="one">Tag 1</Tag>
          <Tag className="two">Tag 2</Tag>
        </TagList>
      ).setState(state);
      child1 = tree.find('.one');
      child2 = tree.find('.two');
    }

    it('supports inline', () => {
      run();
      assert.equal(child1.length, 1);
    });

    it('sets selected when focused and selectedIndex exists', () => {
      run({}, {selectedIndex: 1, focused: true});
      assert.equal(child1.prop('selected'), false);
      assert.equal(child2.prop('selected'), true);
    });

    it('sets tab index when selectedIndex matches index', () => {
      run({}, {selectedIndex: 1});
      assert.equal(child1.prop('tabIndex'), -1);
      assert.equal(child2.prop('tabIndex'), 0);
    });

    it('doesn\'t set tab index when disabled', () => {
      run({disabled: true}, {selectedIndex: 1});
      assert.equal(child1.prop('tabIndex'), -1);
      assert.equal(child2.prop('tabIndex'), -1);
    });

    it('sets closable', () => {
      run();
      assert.equal(child1.prop('closable'), true);
    });

    it('doest set closable when readOnly', () => {
      run({readOnly: true});
      assert.equal(child1.prop('closable'), false);
    });

    it('sets the role', () => {
      run();
      assert.equal(child1.prop('role'), 'option');
    });

    it('sets selectedIndex when child is focused', () => {
      run();
      child2.simulate('focus');
      assert.equal(tree.state('selectedIndex'), 1);
    });

    it('passes down the onClose', () => {
      const onClose = sinon.spy();
      run({onClose});
      child1.props().onClose('Tag 1');
      assert(onClose.calledWith('Tag 1'));
    });

    it('supports values', () => {
      run({values: ['test1', 'test2', 'test3']});
      assert.equal(tree.children().length, 3);
    });

    it('doesnt render passed children with values', () => {
      run({values: ['test1', 'test2']});
      assert.equal(child1.length, 0);
    });

    it('sets the value', () => {
      run({values: ['test1', 'test2']});
      assert.equal(tree.childAt(0).prop('value'), 'test1');
    });

    it('sets the text', () => {
      run({values: ['test1', 'test2']});
      assert.equal(tree.childAt(1).prop('children'), 'test2');
    });
  });
});
