import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';
import selectMenuRenderer from '../src/internal/SelectMenuRenderer';

const testProps = {
  optionComponent: ({ className }) => { return (<div className={ className } />); },
  optionRenderer: () => { return (<div>empty</div>); },
  onOptionRef: () => { return false; },
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
