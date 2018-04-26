import assert from 'assert';
import Radio from '../../src/Radio';
import RadioGroup from '../../src/RadioGroup';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('RadioGroup', () => {
  it('has correct defaults', () => {
    const tree = shallow(<RadioGroup />);
    assert.equal(tree.prop('className'), 'spectrum-FieldGroup');
    assert.equal(tree.type(), 'div');
  });

  it('supports vertical layout', () => {
    const tree = shallow(<RadioGroup vertical />);
    assert.equal(tree.hasClass('spectrum-FieldGroup--vertical'), true);
  });

  it('supports labelsBelow layout', () => {
    const tree = shallow(<RadioGroup labelsBelow />);
    assert.equal(tree.hasClass('spectrum-FieldGroup--labelsBelow'), true);
  });

  describe('selectedValue', () => {
    const onChangeRadioItem = sinon.spy();
    const renderRadioGroupWithChildren = ({childSelectedIndex, ...otherProps} = {}) => shallow(
      <RadioGroup {...otherProps}>
        <Radio value="foo" checked={childSelectedIndex === 0} onChange={onChangeRadioItem} />
        <Radio value="bar" checked={childSelectedIndex === 1} onChange={onChangeRadioItem} />
        <Radio value="foobar" checked={childSelectedIndex === 2} onChange={onChangeRadioItem} />
      </RadioGroup>
    );

    it('makes the child checked', () => {
      const tree = renderRadioGroupWithChildren({selectedValue: 'bar'});
      assert.equal(tree.childAt(1).prop('checked'), true);
      tree.setProps({selectedValue: 'foobar'});
      tree.update();
      assert.equal(tree.childAt(2).prop('checked'), true);
      assert.equal(tree.state('selectedValue'), 'foobar');
    });

    it('makes the child checked with defaultSelectedValue', () => {
      const tree = renderRadioGroupWithChildren({defaultSelectedValue: 'bar'});
      assert.equal(tree.childAt(1).prop('checked'), true);
    });

    it('automatically sets selectedValue if a child is selected', () => {
      const tree = renderRadioGroupWithChildren({childSelectedIndex: 1});
      assert.equal(tree.state('selectedValue'), 'bar');
    });

    it('dispatches onChange which is caught and redispatched by RadioGroup', () => {
      const spy = sinon.spy();
      const stopPropagationSpy = sinon.spy();

      const tree = renderRadioGroupWithChildren({onChange: spy});
      assert(tree.prop('onChange'));
      assert(tree.childAt(0).prop('onChange'));
      assert(tree.childAt(1).prop('onChange'));
      assert(tree.childAt(2).prop('onChange'));
      tree.childAt(1).simulate('change', true, {stopPropagation: stopPropagationSpy});

      assert(spy.called);
      assert(spy.calledWith('bar'));
      assert(stopPropagationSpy.called);
      assert(onChangeRadioItem.called);
      assert(onChangeRadioItem.calledWith('bar'));
    });

    it('throws if child doesn\'t have a value prop', () => {
      assert.throws(() => shallow(<RadioGroup><Radio /><Radio /><Radio /></RadioGroup>));
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<RadioGroup className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<RadioGroup aria-foo />);
    assert.equal(tree.prop('aria-foo'), true);
  });
});
