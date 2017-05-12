import React from 'react';
import assert from 'assert';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import {StepList} from '../../src/StepList';

describe('StepList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<StepList />);
    const innerTree = tree.shallow();
    assert.equal(tree.hasClass('coral-StepList'), true);
    assert.equal(tree.hasClass('coral-StepList--interactive'), true);
    assert.equal(innerTree.type(), 'div');
    assert.equal(innerTree.prop('role'), 'tablist');
    assert.equal(innerTree.prop('aria-multiselectable'), false);
  });

  it('should support size', () => {
    const tree = shallow(<StepList />);
    assert.equal(tree.hasClass('coral-StepList--small'), false);

    tree.setProps({size: 'S'});
    assert.equal(tree.hasClass('coral-StepList--small'), true);
  });

  it('should support interaction', () => {
    const tree = shallow(<StepList />);
    assert.equal(tree.hasClass('coral-StepList--interactive'), true);

    tree.setProps({interaction: 'off'});
    assert.equal(tree.hasClass('coral-StepList--interactive'), false);
  });

  it('should pass the size property to the children', () => {
    const tree = shallow(
      <StepList size="S">
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    const innerTree = tree.shallow();
    const child = innerTree.find('.two');
    assert.equal(child.prop('size'), 'S');
  });

  it('should handle the complete prop for the children before selected', () => {
    const tree = shallow(
      <StepList selectedIndex={ 1 }>
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    const innerTree = tree.shallow();
    let child = innerTree.find('.one');
    assert.equal(child.prop('complete'), true);

    child = innerTree.find('.two');
    assert.equal(child.prop('complete'), false);
  });

  it('should disable the steps when not interactive', () => {
    const spy = sinon.spy();
    const tree = shallow(
      <StepList interaction="off">
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    const innerTree = tree.shallow();
    const child = innerTree.find('.two');
    child.simulate('click');

    assert(!spy.called);
  });
});
