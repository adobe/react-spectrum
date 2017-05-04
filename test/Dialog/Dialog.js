import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Dialog from '../../src/Dialog';




describe.only('Datepicker', () => {
  it('default', () => {
    const tree = shallow(<Dialog title="title" />);
    expect(tree.hasClass('coral-Heading--3')).toBe(true);
    expect(tree.hasClass('coral-Dialog-title')).toBe(true);
    expect(tree.node).toBe('title');
  });
});
