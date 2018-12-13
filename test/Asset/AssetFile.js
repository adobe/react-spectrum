import assert from 'assert';
import {AssetFile} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('AssetFile', () => {
  it('should display a File Icon', () => {
    const tree = shallow(<AssetFile className="my-class" />);
    assert.equal(tree.find('.spectrum-Asset-file').length, 1);
    assert.equal(tree.find('.my-class').length, 1);
    assert.equal(tree.prop('role'), 'img');
  });
  it('should include alt text for accessibility', () => {
    const tree = shallow(<AssetFile />);
    assert.equal(tree.prop('aria-label'), 'File');
    tree.setProps({alt: 'Filename'});
    assert.equal(tree.prop('aria-label'), 'Filename');
  });
  it('should support decorative to hide element from screen readers', () => {
    const tree = shallow(<AssetFile decorative />);
    assert.equal(tree.prop('aria-hidden'), true);
    tree.setProps({decorative: false});
    assert.equal(tree.prop('aria-hidden'), null);
  });
});
