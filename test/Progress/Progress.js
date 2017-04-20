import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Progress from '../../src/Progress';

describe('Progress', () => {
  it('default', () => {
    const tree = shallow(<Progress />);
    expect(tree.hasClass('coral-Progress')).toBe(true);
    expect(tree.hasClass('coral-Progress--medium')).toBe(true);
    expect(tree.hasClass('coral-Progress--noLabel')).toBe(true);
    expect(tree.prop('aria-valuemin')).toBe(0);
    expect(tree.prop('aria-valuemax')).toBe(100);
    expect(tree.prop('aria-valuenow')).toBe(0);

    const bar = tree.find('.coral-Progress-bar');
    expect(bar.prop('className')).toBe('coral-Progress-bar');
    const status = findStatus(tree);
    expect(status.prop('className')).toBe('coral-Progress-status');
    expect(status.prop('style')).toEqual({width: '0%'});

    expect(tree.find('.coral-Progress-label').node).toNotExist();
  });

  describe('value', () => {
    it('updates all the fields', () => {
      const tree = shallow(<Progress value="30" showPercent />);
      expect(tree.prop('aria-valuenow')).toBe(30);
      expect(findStatus(tree).prop('style')).toEqual({width: '30%'});
      expect(findLabel(tree).text()).toBe('30%');
    });

    it('clamps values to 0-100', () => {
      const tree = shallow(<Progress value="10000" showPercent />);
      expect(tree.prop('aria-valuenow')).toBe(100);
      expect(findStatus(tree).prop('style')).toEqual({width: '100%'});
      expect(findLabel(tree).text()).toBe('100%');

      tree.setProps({value: '-1'});
      expect(tree.prop('aria-valuenow')).toBe(0);
      expect(findStatus(tree).prop('style')).toEqual({width: '0%'});
      expect(findLabel(tree).text()).toBe('0%');
    });
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Progress size="L" />);
    expect(tree.hasClass('coral-Progress--large')).toBe(true);
    tree.setProps({size: 'S'});
    expect(tree.hasClass('coral-Progress--small')).toBe(true);
  });

  it('supports indeterminate', () => {
    const tree = shallow(<Progress indeterminate value="50" />);
    expect(tree.hasClass('coral-Progress--indeterminate')).toBe(true);
    expect(tree.prop('aria-valuemin')).toNotExist();
    expect(tree.prop('aria-valuemax')).toNotExist();
    expect(tree.prop('aria-valuenow')).toNotExist();
    expect(findStatus(tree).prop('style')).toEqual({width: '0%'});
  });

  describe('label', () => {
    it('supports showPercent', () => {
      const tree = shallow(<Progress showPercent />);
      expect(tree.hasClass('coral-Progress--rightLabel')).toBe(true);
      const label = findLabel(tree);
      expect(label.node).toExist();
      expect(label.text()).toBe('0%');

      tree.setProps({value: 50});
      expect(findLabel(tree).text()).toBe('50%');
    });

    it('supports labelPosition', () => {
      const tree = shallow(<Progress showPercent labelPosition="left" />);
      expect(tree.hasClass('coral-Progress--leftLabel')).toBe(true);
      tree.setProps({labelPosition: 'bottom'});
      expect(tree.hasClass('coral-Progress--bottomLabel')).toBe(true);
    });

    it('support custom labels', () => {
      const tree = shallow(<Progress label="foo" />);
      expect(findLabel(tree).text()).toBe('foo');
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Progress className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Progress foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findStatus = tree => tree.find('.coral-Progress-status');
const findLabel = tree => tree.find('.coral-Progress-label');
