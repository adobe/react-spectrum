import assert from 'assert';
import Pagination from '../../src/Pagination';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const ENTER_EVENT = {key: 'Enter'};

describe('Pagination', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Pagination />, {disableLifecycleMethods: true});
    const buttons = tree.find('Button');
    assert.equal(buttons.at(0).prop('className'), 'spectrum-Pagination-prevButton');
    assert.equal(buttons.at(0).prop('variant'), 'primary');
    assert.equal(buttons.at(1).prop('className'), 'spectrum-Pagination-nextButton');
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
    assert(tree.find('Textfield').length === 1);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Pagination aria-foo className="className" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('aria-foo'), true);
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
    it('on keyDown', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={10} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Down'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(9, ENTER_EVENT));
    });

    it('on keyUp', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={10} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Up'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(11, ENTER_EVENT));
    });

    it('on keyDown when on firstPage', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={1} totalPages={20} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Down'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(1, ENTER_EVENT));
    });

    it('on keyUp when on lastPage', () => {
      const spy = sinon.spy();
      const tree = shallow(<Pagination defaultPage={20} totalPages={20} variant="explicit" onChange={spy} />);
      tree.find('Textfield').simulate('keyDown', {key: 'Up'});
      tree.find('Textfield').simulate('keyDown', ENTER_EVENT);
      assert(spy.calledWith(20, ENTER_EVENT));
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
});
