import React from 'react';
import expect from 'expect';
import Accordion from '../src/Accordion';
import { shallow } from 'enzyme';

describe('Accordion', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<Accordion className="myClass" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('myClass')).toBe(true);
  });

  it('supports quiet variant', () => {
    const tree = shallow(<Accordion variant="quiet" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('coral3-Accordion--quiet')).toBe(true);
  });

  it('supports large variant', () => {
    const tree = shallow(<Accordion variant="large" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('coral3-Accordion--large')).toBe(true);
  });
});
