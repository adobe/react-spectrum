import React from 'react';
import expect, {createSpy} from 'expect';
import {shallow} from 'enzyme';
import {StepList} from '../../src/StepList';

describe('StepList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<StepList />);
    const innerTree = tree.shallow();
    expect(tree.hasClass('coral-StepList')).toBe(true);
    expect(tree.hasClass('coral-StepList--interactive')).toBe(true);
    expect(innerTree.type()).toBe('div');
    expect(innerTree.prop('role')).toBe('tablist');
    expect(innerTree.prop('aria-multiselectable')).toBe(false);
  });

  it('should support size', () => {
    const tree = shallow(<StepList />);
    expect(tree.hasClass('coral-StepList--small')).toBe(false);

    tree.setProps({size: 'S'});
    expect(tree.hasClass('coral-StepList--small')).toBe(true);
  });

  it('should support interaction', () => {
    const tree = shallow(<StepList />);
    expect(tree.hasClass('coral-StepList--interactive')).toBe(true);

    tree.setProps({interaction: 'off'});
    expect(tree.hasClass('coral-StepList--interactive')).toBe(false);
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
    expect(child.prop('size')).toBe('S');
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
    expect(child.prop('complete')).toBe(true);

    child = innerTree.find('.two');
    expect(child.prop('complete')).toBe(false);
  });

  it('should disable the steps when not interactive', () => {
    const spy = createSpy();
    const tree = shallow(
      <StepList interaction="off">
        <div className="one">a</div>
        <div className="two">b</div>
      </StepList>
    );
    const innerTree = tree.shallow();
    const child = innerTree.find('.two');
    child.simulate('click');

    expect(spy).toNotHaveBeenCalled();
  });
});
