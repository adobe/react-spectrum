import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Step, StepList} from '../../src/StepList';

describe('StepList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<StepList />);
    const innerTree = tree.shallow().shallow();
    assert.equal(tree.hasClass('spectrum-Steplist'), true);
    assert.equal(tree.hasClass('spectrum-Steplist--interactive'), true);
    assert.equal(innerTree.type(), 'div');
    assert.equal(innerTree.prop('role'), 'tablist');
    assert.equal(innerTree.prop('aria-multiselectable'), false);
  });

  it('should support size', () => {
    const tree = shallow(<StepList />);
    assert.equal(tree.hasClass('spectrum-Steplist--small'), false);

    tree.setProps({size: 'S'});
    assert.equal(tree.hasClass('spectrum-Steplist--small'), true);

    tree.setProps({size: 'L'});
    assert.equal(tree.hasClass('spectrum-Steplist--small'), false);
  });

  it('should support interaction', () => {
    const tree = shallow(<StepList />);
    assert.equal(tree.hasClass('spectrum-Steplist--interactive'), true);

    tree.setProps({interaction: 'off'});
    assert.equal(tree.hasClass('spectrum-Steplist--interactive'), false);
  });

  it('should pass the size property to the children', () => {
    // size="S"
    let tree = shallow(
      <StepList size="S">
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    let innerTree = tree.shallow();
    let child = innerTree.find('.two');
    assert.equal(child.prop('size'), 'S');

    // size="L"
    tree = shallow(
      <StepList size="L">
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    innerTree = tree.shallow();
    child = innerTree.find('.one');
    assert.equal(child.prop('size'), 'L');
  });

  it('should handle the complete prop for the children before selected', () => {
    const tree = shallow(
      <StepList selectedIndex={1}>
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

  describe('Step', () => {
    it('has correct defaults', () => {
      const tree = shallow(<Step />);
      assert.equal(tree.hasClass('spectrum-Steplist-item'), true);
      assert.equal(tree.type(), 'div');
      assert.equal(tree.prop('role'), 'tab');
      assert.equal(tree.childAt(0).hasClass('spectrum-Steplist-label'), true);
      assert.equal(tree.childAt(1).hasClass('spectrum-Steplist-markerContainer'), true);
      assert.equal(tree.childAt(2).hasClass('spectrum-Steplist-segment'), true);
      tree.setProps({
        selected: true,
        complete: true
      });
      tree.update();
      assert.equal(tree.hasClass('is-selected'), true);
      assert.equal(tree.hasClass('is-complete'), true);
      assert.equal(tree.prop('aria-selected'), true);
      tree.setProps({
        selected: false,
        complete: false
      });
      assert.equal(tree.hasClass('is-selected'), false);
      assert.equal(tree.hasClass('is-complete'), false);
      assert.equal(tree.prop('aria-selected'), false);
    });
  });
});
