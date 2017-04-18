import React from 'react';
import expect, { createSpy } from 'expect';
import { shallow } from 'enzyme';
import RadioGroup from '../../src/RadioGroup';
import Radio from '../../src/Radio';

describe('RadioGroup', () => {
  it('has correct defaults', () => {
    const tree = shallow(<RadioGroup />);
    expect(tree.prop('className')).toBe('coral-RadioGroup');
    expect(tree.type()).toBe('div');
  });

  it('supports vertical layout', () => {
    const tree = shallow(<RadioGroup vertical />);
    expect(tree.hasClass('coral-RadioGroup--vertical')).toBe(true);
  });

  it('supports labelsBelow layout', () => {
    const tree = shallow(<RadioGroup labelsBelow />);
    expect(tree.hasClass('coral-RadioGroup--labelsBelow')).toBe(true);
  });

  describe('selectedValue', () => {
    const renderRadioGroupWithChildren = ({ childSelectedIndex, ...otherProps } = {}) => shallow(
      <RadioGroup { ...otherProps }>
        <Radio value="foo" checked={ childSelectedIndex === 0 } />
        <Radio value="bar" checked={ childSelectedIndex === 1 } />
        <Radio value="foobar" checked={ childSelectedIndex === 2 } />
      </RadioGroup>
    );

    it('makes the child checked', () => {
      const tree = renderRadioGroupWithChildren({ selectedValue: 'bar' });
      expect(tree.childAt(1).prop('checked')).toBe(true);
    });

    it('makes the child checked with defaultSelectedValue', () => {
      const tree = renderRadioGroupWithChildren({ defaultSelectedValue: 'bar' });
      expect(tree.childAt(1).prop('checked')).toBe(true);
    });

    it('automatically sets selectedValue if a child is selected', () => {
      const tree = renderRadioGroupWithChildren({ childSelectedIndex: 1 });
      expect(tree.state('selectedValue')).toBe('bar');
    });

    it('dispatches onChange which is caught and redispatched by RadioGroup', () => {
      const spy = createSpy();
      const stopPropagationSpy = createSpy();

      const tree = renderRadioGroupWithChildren({ onChange: spy });
      expect(tree.prop('onChange')).toExist();
      tree.childAt(1).simulate('change', { stopPropagation: stopPropagationSpy });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('bar');
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('throws if child doesn\'t have a value prop', () => {
      expect(() => shallow(<RadioGroup><Radio /><Radio /><Radio /></RadioGroup>)).toThrow();
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<RadioGroup className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<RadioGroup foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
