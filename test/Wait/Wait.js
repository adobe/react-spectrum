import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Wait from '../../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate');
    assert.equal(tree.type(), 'div');
  });

  it('accessibility props', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), 0);
    assert.equal(tree.prop('aria-valuemax'), 100);
    assert.equal(tree.prop('aria-valuenow'), null);
  });

  it('accessibility props determinate', () => {
    const tree = shallow(<Wait variant="determinate" value={75} />);
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), 0);
    assert.equal(tree.prop('aria-valuemax'), 100);
    assert.equal(tree.prop('aria-valuenow'), 75);
  });

  it('shows none of the circle for 0%', () => {
    const tree = shallow(<Wait variant="determinate" value={0} />);
    const mask1 = tree.find('.spectrum-Loader-fill-submask-1');
    const mask2 = tree.find('.spectrum-Loader-fill-submask-2');
    assert.equal(mask1.prop('style').transform, undefined);
    assert.equal(mask2.prop('style').transform, undefined);
  });

  it('shows quarter of the circle for 25%', () => {
    const tree = shallow(<Wait variant="determinate" value={25} />);
    const mask1 = tree.find('.spectrum-Loader-fill-submask-1');
    const mask2 = tree.find('.spectrum-Loader-fill-submask-2');
    assert.equal(mask1.prop('style').transform, 'rotate(-90deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-180deg)');
  });

  it('shows half the circle for 50%', () => {
    const tree = shallow(<Wait variant="determinate" value={50} />);
    const mask1 = tree.find('.spectrum-Loader-fill-submask-1');
    const mask2 = tree.find('.spectrum-Loader-fill-submask-2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-180deg)');
  });

  it('shows quarter of the circle for 75%', () => {
    const tree = shallow(<Wait variant="determinate" value={75} />);
    const mask1 = tree.find('.spectrum-Loader-fill-submask-1');
    const mask2 = tree.find('.spectrum-Loader-fill-submask-2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-90deg)');
  });

  it('shows all of the circle for 100%', () => {
    const tree = shallow(<Wait variant="determinate" value={100} />);
    const mask1 = tree.find('.spectrum-Loader-fill-submask-1');
    const mask2 = tree.find('.spectrum-Loader-fill-submask-2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(0deg)');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate spectrum-Loader--large');
  });

  it('supports size S', () => {
    const tree = shallow(<Wait size="S" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate spectrum-Loader--small');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate react-spectrum-Wait--centered');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Loader spectrum-Loader--indeterminate myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait aria-foo />);
    assert.equal(tree.prop('aria-foo'), true);
  });
});
