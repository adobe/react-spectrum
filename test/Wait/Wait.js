import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Wait from '../../src/Wait';

describe('Wait', () => {
  it('default', () => {
    const tree = shallow(<Wait />);
    assert.equal(tree.prop('className'), 'spectrum-CircleLoader spectrum-CircleLoader--indeterminate');
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
    const tree = shallow(<Wait indeterminate={false} value={75} />);
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), 0);
    assert.equal(tree.prop('aria-valuemax'), 100);
    assert.equal(tree.prop('aria-valuenow'), 75);
  });

  it('shows none of the circle for 0%', () => {
    const tree = shallow(<Wait indeterminate={false} value={0} />);
    const mask1 = tree.find('.spectrum-CircleLoader-fillSubMask1');
    const mask2 = tree.find('.spectrum-CircleLoader-fillSubMask2');
    assert.equal(mask1.prop('style').transform, undefined);
    assert.equal(mask2.prop('style').transform, undefined);
  });

  it('shows quarter of the circle for 25%', () => {
    const tree = shallow(<Wait indeterminate={false} value={25} />);
    const mask1 = tree.find('.spectrum-CircleLoader-fillSubMask1');
    const mask2 = tree.find('.spectrum-CircleLoader-fillSubMask2');
    assert.equal(mask1.prop('style').transform, 'rotate(-90deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-180deg)');
  });

  it('shows half the circle for 50%', () => {
    const tree = shallow(<Wait indeterminate={false} value={50} />);
    const mask1 = tree.find('.spectrum-CircleLoader-fillSubMask1');
    const mask2 = tree.find('.spectrum-CircleLoader-fillSubMask2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-180deg)');
  });

  it('shows quarter of the circle for 75%', () => {
    const tree = shallow(<Wait indeterminate={false} value={75} />);
    const mask1 = tree.find('.spectrum-CircleLoader-fillSubMask1');
    const mask2 = tree.find('.spectrum-CircleLoader-fillSubMask2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(-90deg)');
  });

  it('shows all of the circle for 100%', () => {
    const tree = shallow(<Wait indeterminate={false} value={100} />);
    const mask1 = tree.find('.spectrum-CircleLoader-fillSubMask1');
    const mask2 = tree.find('.spectrum-CircleLoader-fillSubMask2');
    assert.equal(mask1.prop('style').transform, 'rotate(0deg)');
    assert.equal(mask2.prop('style').transform, 'rotate(0deg)');
  });

  it('supports size L', () => {
    const tree = shallow(<Wait size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-CircleLoader spectrum-CircleLoader--indeterminate spectrum-CircleLoader--large');
  });

  it('supports size S', () => {
    const tree = shallow(<Wait size="S" />);
    assert.equal(tree.prop('className'), 'spectrum-CircleLoader spectrum-CircleLoader--indeterminate spectrum-CircleLoader--small');
  });

  it('supports centered', () => {
    const tree = shallow(<Wait centered />);
    assert.equal(tree.prop('className'), 'spectrum-CircleLoader spectrum-CircleLoader--indeterminate react-spectrum-Wait--centered');
  });

  it('supports overBackground', () => {
    const tree = shallow(<Wait variant="overBackground" />);
    assert.equal(tree.hasClass('spectrum-CircleLoader--overBackground'), true);
    tree.setProps({variant: null});
    assert.equal(tree.hasClass('spectrum-CircleLoader--overBackground'), false);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Wait className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-CircleLoader spectrum-CircleLoader--indeterminate myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Wait aria-foo />);
    assert.equal(tree.prop('aria-foo'), true);
  });
});
