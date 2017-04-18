import React from 'react';
import expect from 'expect';
import {mount} from 'enzyme';
import selectMenuRenderer from '../../src/Select/js/SelectMenuRenderer';

const testProps = {
  optionComponent: ({className}) => <div className={ className } />,
  optionRenderer: () => <div>empty</div>,
  onOptionRef: () => false,
  options: [
    {
      label: 'Chocolate',
      value: 'chocolate',
      className: 'myClass'
    }
  ]
};

describe('SelectMenuRenderer', () => {
  it('supports additional option classNames', () => {
    const tree = mount(<div>{selectMenuRenderer(testProps)}</div>);
    const option = tree.find('.coral-BasicList-item');

    expect(option.hasClass('myClass')).toBe(true);
  });
});
