import assert from 'assert';
import Radio from '../../src/Radio';
import RadioGroup from '../../src/RadioGroup';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('RadioGroup', () => {
  it('has correct defaults', () => {
    const tree = shallow(<RadioGroup />);
    assert.equal(tree.prop('className'), 'coral-RadioGroup');
    assert.equal(tree.type(), 'div');
  });

  it('supports vertical layout', () => {
    const tree = shallow(<RadioGroup vertical />);
    assert.equal(tree.hasClass('coral-RadioGroup--vertical'), true);
  });

  it('supports labelsBelow layout', () => {
    const tree = shallow(<RadioGroup labelsBelow />);
    assert.equal(tree.hasClass('coral-RadioGroup--labelsBelow'), true);
  });

  describe('selectedValue', () => {
    const renderRadioGroupWithChildren = ({childSelectedIndex, ...otherProps} = {}) => shallow(
      <RadioGroup {...otherProps}>
        <Radio value="foo" checked={childSelectedIndex === 0} />
        <Radio value="bar" checked={childSelectedIndex === 1} />
        <Radio value="foobar" checked={childSelectedIndex === 2} />
      </RadioGroup>
    );

    it('makes the child checked', () => {
      const tree = renderRadioGroupWithChildren({selectedValue: 'bar'});
      assert.equal(tree.childAt(1).prop('checked'), true);
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
      tree.childAt(1).simulate('change', true, {stopPropagation: stopPropagationSpy});

      assert(spy.called);
      assert(spy.calledWith('bar'));
      assert(stopPropagationSpy.called);
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
    const tree = shallow(<RadioGroup foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
