import assert from 'assert';
import {AssetFolder} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('AssetFolder', () => {
  it('should display a Folder Icon', () => {
    const tree = shallow(<AssetFolder className="my-class" />);
    assert(tree.find('.spectrum-Asset-folder'), true);
    assert(tree.find('.my-class'), true);
    assert.equal(tree.prop('role'), 'img');
  });
  it('should include alt text for accessibility', () => {
    const tree = shallow(<AssetFolder />);
    assert.equal(tree.prop('aria-label'), 'Folder');
    tree.setProps({alt: 'Folder name'});
    assert.equal(tree.prop('aria-label'), 'Folder name');
  });
  it('should support decorative to hide element from screen readers', () => {
    const tree = shallow(<AssetFolder decorative />);
    assert.equal(tree.prop('aria-hidden'), true);
    tree.setProps({decorative: false});
    assert.equal(tree.prop('aria-hidden'), null);
  });
});
