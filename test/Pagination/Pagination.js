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
import Pagination from '../../src/Pagination';
import React from 'react';
import sinon from 'sinon';

const ENTER_EVENT = {key: 'Enter'};
const ARROW_DOWN_EVENT = {key: 'ArrowDown'};
const ARROW_UP_EVENT = {key: 'ArrowUp'};

describe('Pagination', () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.runAll();
    clock.restore();
  });

  it('has correct defaults', () => {
    const tree = shallow(<Pagination />, {disableLifecycleMethods: true});
    const buttons = tree.find('Button');
    assert.equal(buttons.at(0).prop('className'), 'spectrum-SplitButton-trigger');
    assert.equal(buttons.at(0).prop('variant'), 'primary');
    assert.equal(buttons.at(1).prop('className'), 'spectrum-SplitButton-action');
  });

  it('supports button:cta', () => {
    const tree = shallow(<Pagination mode="cta" />, {disableLifecycleMethods: true});
    assert.equal(tree.find('Button').at(0).prop('variant'), 'cta');
  });

  it('supports button:secondary', () => {
    const tree = shallow(<Pagination mode="secondary" />, {disableLifecycleMethods: true});
    assert.equal(tree.find('Button').at(0).prop('variant'), 'secondary');
  });

  it('supports explicit variant', () => {
    const tree = shallow(<Pagination variant="explicit" />, {disableLifecycleMethods: true});
    const buttons = tree.find('Button');
    assert.equal(buttons.at(0).prop('className'), 'spectrum-Pagination-prevButton');
    assert.equal(buttons.at(1).prop('className'), 'spectrum-Pagination-nextButton');
    assert(tree.find('Textfield').length === 1);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Pagination aria-hidden className="className" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.prop('className'), 'className');
  });

  describe('events', () => {
    it('onPrevious triggers', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={2} onPrevious={spy} />);
      tree.find('Button').at(0).simulate('click');
      assert(spy.callCount === 1);
    });

    it('onNext triggers', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination onNext={spy} />);
      tree.find('Button').at(1).simulate('click');
      assert(spy.callCount === 1);
    });

    it('onChange triggers', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('change', '20');
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(20, ENTER_EVENT));
    });

    it('onChange not triggered when empty input', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination totalPages={15} defaultPage={13} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('change', '');
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.callCount === 0);
    });

    it('onChange triggered with same pagenumber when invalid value is input', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination totalPages={15} defaultPage={13} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('change', 'dsdfsd');
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(13, ENTER_EVENT));
    });
  });

  describe('returns correct page', () => {
    it('on ArrowDown key', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={10} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', ARROW_DOWN_EVENT);
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(9, ENTER_EVENT));
      tree.find('Textfield').simulate('keyDown', ARROW_DOWN_EVENT);
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(8, ENTER_EVENT));

    });

    it('on ArrowUp key', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={10} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', ARROW_UP_EVENT);
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(11, ENTER_EVENT));
      tree.find('Textfield').simulate('keyDown', ARROW_UP_EVENT);
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(12, ENTER_EVENT));
    });

    it('on key down when on firstPage', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={1} totalPages={20} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Down'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(1, ENTER_EVENT));
    });

    it('on key up when on lastPage', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={20} totalPages={20} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Up'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(20, ENTER_EVENT));
    });

    it('on Tab key', () => {
      const tree = shallow(<Pagination defaultPage={20} totalPages={20} variant="explicit" />);
      tree.find('Textfield').simulate('keyDown', {key: 'Tab'});
    });
  });

  describe('uncontrolled behavior', () => {
    it('does change page number when previous/next is clicked', () => {
      const tree = shallow(<Pagination defaultPage={3} totalPages={20} variant="explicit" />);
      tree.find('Button').at(0).simulate('click');
      assert.equal(tree.find('Textfield').prop('value'), 2);
      tree.find('Button').at(1).simulate('click');
      assert.equal(tree.find('Textfield').prop('value'), 3);
    });
  });

  describe('controlled behavior', () => {
    it('onPrevious/onNext is triggered when previous/next is clicked', () => {
      const onPreviousSpy = sinon.spy();
      const onNextSpy = sinon.spy();
      const tree = shallow(<Pagination currentPage={2} totalPages={20} variant="explicit" onPrevious={onPreviousSpy} onNext={onNextSpy} />);
      tree.find('Button').at(0).simulate('click', 'clickEvent');
      assert(onPreviousSpy.calledWith(1, 'clickEvent'));
      tree.find('Button').at(1).simulate('click', 'clickEvent');
      assert(onNextSpy.calledWith(3, 'clickEvent'));
    });

    it('does not change page number when previous/next is clicked', () => {
      const tree = shallow(<Pagination currentPage={3} totalPages={20} variant="explicit" />);
      tree.find('Button').at(0).simulate('click');
      assert.equal(tree.find('Textfield').prop('value'), 3);
      tree.find('Button').at(1).simulate('click');
      assert.equal(tree.find('Textfield').prop('value'), 3);
    });

    it('does change page number when currentPage prop is changed', () => {
      const onNextSpy = sinon.spy();
      const tree = shallow(<Pagination currentPage={3} totalPages={20} variant="explicit" onNext={onNextSpy} />);
      tree.setProps({currentPage: 7});
      assert.equal(tree.find('Textfield').prop('value'), 7);
    });

    it('has correct state when currentPage prop is updated', () => {
      const onNextSpy = sinon.spy();
      const tree = shallow(<Pagination currentPage={3} totalPages={20} variant="explicit" onNext={onNextSpy} />);
      tree.setProps({currentPage: 7});
      assert.equal(tree.find('Textfield').prop('value'), 7);
      assert.equal(tree.state('currentPage'), 7);
      tree.find('Button').at(1).simulate('click');
      assert(onNextSpy.calledWith(8));
    });

    it('always triggers with currentIndex prop irrespective of internal actions', () => {
      const onNextSpy = sinon.spy();
      const onPreviousSpy = sinon.spy();
      const onChangeSpy = sinon.spy();
      const tree = shallow(<Pagination currentPage={3} totalPages={20} variant="explicit" onChange={onChangeSpy} onNext={onNextSpy} onPrevious={onPreviousSpy} />);
      tree.find('Textfield').simulate('change', '20');
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(onChangeSpy.calledWith(20, ENTER_EVENT));
      tree.find('Button').at(0).simulate('click');
      assert(onPreviousSpy.calledWith(2));
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label and aria-labelledby for container nav element', () => {
      const tree = shallow(<Pagination />);
      const id = tree.prop('id');
      assert.equal(tree.prop('aria-label'), 'Page navigation');
      tree.setProps({'aria-label': 'Items'});
      assert.equal(tree.prop('aria-label'), 'Items');
      tree.setProps({'aria-labelledby': id});
      assert.equal(tree.prop('aria-labelledby'), id);
    });

    describe('focus management (mounted)', () => {
      let tree;

      afterEach(() => {
        if (tree) {
          tree.unmount();
          tree = null;
        }
      });

      it('keeps focus to Previous button when it disables', () => {
        tree = mount(<Pagination totalPages={10} defaultPage={2} />);
        tree.find('Button').first().getDOMNode().focus();
        assert.equal(document.activeElement, tree.find('Button').first().getDOMNode());
        tree.find('Button').first().simulate('click');
        clock.runAll();
        assert.equal(tree.find('Button').first().prop('aria-disabled'), true);
        assert.equal(tree.find('Button').first().prop('tabIndex'), -1);
        assert.equal(document.activeElement, tree.find('Button').first().getDOMNode());
      });

      it('keeps focus on Next button when it disables', () => {
        tree = mount(<Pagination totalPages={10} defaultPage={9} />);
        tree.find('Button').last().getDOMNode().focus();
        assert.equal(document.activeElement, tree.find('Button').last().getDOMNode());
        tree.find('Button').last().simulate('click');
        clock.runAll();
        assert.equal(tree.find('Button').last().prop('aria-disabled'), true);
        assert.equal(tree.find('Button').last().prop('tabIndex'), -1);
        assert.equal(document.activeElement, tree.find('Button').last().getDOMNode());
      });

      it('keeps focus on Previous or Next button when either disables', () => {
        tree = mount(<Pagination variant="explicit" totalPages={10} defaultPage={9} />);
        tree.find('Button').last().getDOMNode().focus();
        assert.equal(document.activeElement, tree.find('Button').last().getDOMNode());
        tree.find('Button').last().simulate('click');
        clock.runAll();
        assert.equal(tree.find('Button').last().prop('disabled'), true);
        assert.equal(tree.find('Button').last().prop('tabIndex'), -1);
        assert.equal(document.activeElement, tree.find('Button').last().getDOMNode());
        tree.setState({currentPage: 2, pageInput: 2});
        tree.find('Button').first().getDOMNode().focus();
        assert.equal(document.activeElement, tree.find('Button').first().getDOMNode());
        tree.find('Button').first().simulate('click');
        clock.runAll();
        assert.equal(tree.find('Button').first().prop('disabled'), true);
        assert.equal(tree.find('Button').first().prop('tabIndex'), -1);
        assert.equal(document.activeElement, tree.find('Button').first().getDOMNode());
      });

      it('sets value on input change followed by Previous or Next button', () => {
        tree = mount(<Pagination variant="explicit" totalPages={10} defaultPage={5} />);
        tree.find('Textfield').simulate('focus');

        // set pageInput as if set by arrow key but without committing the change event with Enter key
        tree.setState({pageInput: 1});
        tree.update();

        // blurring the textfield should restore pageInput to currentPage without committing the change
        tree.find('Textfield').simulate('blur');
        tree.update();

        assert.equal(tree.state('currentPage'), 5);
        assert.equal(tree.state('pageInput'), 5);

        // trigger click on Next button element
        tree.find('Button').last().simulate('focus');
        tree.find('Button').last().simulate('click');
        clock.runAll();

        // page should update based on currentPage value
        assert.equal(tree.state('currentPage'), 6);
        assert.equal(tree.state('pageInput'), 6);

        tree.find('Textfield').simulate('focus');

        // set pageInput as if set by arrow key but without committing the change event with Enter key
        tree.setState({pageInput: 10});
        tree.update();

        // blurring the textfield should restore pageInput to currentPage without committing the change
        tree.find('Textfield').simulate('blur');
        tree.update();

        assert.equal(tree.state('currentPage'), 6);
        assert.equal(tree.state('pageInput'), 6);

        // trigger click on Previous button element
        tree.find('Button').first().simulate('focus');
        tree.find('Button').first().simulate('click');
        clock.runAll();

        // page should update based on currentPage value
        assert.equal(tree.state('currentPage'), 5);
        assert.equal(tree.state('pageInput'), 5);
      });


    });

  });
});
