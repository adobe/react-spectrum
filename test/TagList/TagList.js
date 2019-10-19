/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {Tag, TagList} from '../../src/TagList';

describe('TagList', () => {
  it('has correct classname when disabled', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(findTagList(tree).hasClass('is-disabled'), true);
  });

  it('has spectrum class', () => {
    const tree = shallow(<TagList />);
    assert.equal(findTagList(tree).hasClass('spectrum-Tags'), true);
  });

  it('passes in a custom class', () => {
    const tree = shallow(<TagList className="squid" />);
    assert.equal(findTagList(tree).hasClass('squid'), true);
  });

  it('sets role="group" when there are no children', () => {
    const tree = shallow(<TagList />);
    assert.equal(findTagList(tree).prop('role'), 'group');
  });

  it('sets the name', () => {
    const tree = shallow(<TagList name="Friendly" />);
    assert.equal(findTagList(tree).prop('name'), 'Friendly');
  });

  it('sets the aria-disabled', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(findTagList(tree).prop('aria-disabled'), true);
  });

  it('sets the aria-invalid', () => {
    const tree = shallow(<TagList invalid />);
    assert.equal(findTagList(tree).prop('aria-invalid'), true);
  });

  it('sets readOnly', () => {
    const tree = shallow(<TagList readOnly />);
    assert.equal(findTagList(tree).prop('readOnly'), true);
  });

  it('sets disabled on the element', () => {
    const tree = shallow(<TagList disabled />);
    assert.equal(findTagList(tree).prop('disabled'), true);
  });

  it('sets focused state when onFocus', () => {
    const spy = sinon.spy();
    const tree = shallow(<TagList onFocus={spy} />);
    assert.equal(tree.state('focused'), false);
    findTagList(tree).simulate('focus');
    assert(spy.called);
    assert.equal(tree.state('focused'), true);
  });

  it('removes focused state when onBlur', () => {
    const spy = sinon.spy();
    const tree = shallow(<TagList onBlur={spy} />).setState({focused: true});
    findTagList(tree).simulate('blur');
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
          <Tag className="one" closable>Tag 1</Tag>
          <Tag className="two" closable>Tag 2</Tag>
        </TagList>
      ).setState(state);
      child1 = tree.find('.one');
      child2 = tree.find('.two');
    }

    it('sets role="grid" when there are children', () => {
      run();
      assert.equal(findTagList(tree).prop('role'), 'grid');
    });

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
      assert.equal(child1.prop('role'), 'gridcell');
    });

    it('passes down the onClose', () => {
      const onClose = sinon.spy();
      run({onClose});
      child1.prop('onClose')('Tag 1');
      assert(onClose.calledWith('Tag 1'));
    });

    it('supports values', () => {
      run({values: ['test1', 'test2', 'test3']});
      assert.equal(findTagList(tree).prop('role'), 'grid');
      assert.equal(findTagList(tree).children().length, 3);
    });

    it('doesnt render passed children with values', () => {
      run({values: ['test1', 'test2']});
      assert.equal(child1.find('div').length, 0);
    });

    it('sets the value', () => {
      run({values: ['test1', 'test2']});
      assert.equal(findTagList(tree).childAt(0).prop('value'), 'test1');
    });

    it('sets the text', () => {
      run({values: ['test1', 'test2']});
      assert.equal(findTagList(tree).childAt(1).prop('children'), 'test2');
    });

    it("triggers tag's onClick handler", () => {
      const onClick = sinon.spy();
      tree = shallow(
        <TagList>
          <Tag className="one" onClick={onClick} closable>Tag 1</Tag>
          <Tag className="two" closable>Tag 2</Tag>
        </TagList>
      );
      tree.find(Tag).at(0).simulate('click');
      assert(onClick.calledOnce);
    });

    describe('Keyboard navigation', () => {
      let tree;
      let tag;

      before(() => {
        tree = mount(
          <TagList>
            <Tag id="tag1" className="one" closable>Tag 1</Tag>
            <Tag id="tag2" className="two" closable>Tag 2</Tag>
          </TagList>
        );
      });

      after(() => {
        tree.unmount();
      });

      it('when ArrowRight key is pressed, focus next tag, ArrowLeft Focuses previous', () => {
        tag = findTagItemAt(tree, 0);

        tag.simulate('focus');
        tag.simulate('keydown', {key: 'ArrowRight', preventDefault: () => {}});
        assert.equal(findTagItemAt(tree, 1).prop('id'), document.activeElement.id);

        tree.update();

        tag = findTagItemAt(tree, 1);
        tag.simulate('keydown', {key: 'ArrowLeft', preventDefault: () => {}});
        assert.equal(findTagItemAt(tree, 0).prop('id'), document.activeElement.id);
        assert.equal(tree.state('selectedIndex'), 0);

      });
    });
  });
});

const findTagList = (tree) => tree.childAt(0);
const findTagAt = (tree, index) => tree.find(Tag).at(index);
const findTagItemAt = (tree, index) => findTagAt(findTagList(tree), index);
