import assert from 'assert';
import {Asset} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('Asset', () => {
  it('should support AssetFile as the default content', () => {
    const tree = shallow(<Asset />);
    assert.equal(tree.find('AssetFile').length, 1);
  });

  it('should support AssetImage when type is image', () => {
    let imgSrc = 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03578.jpg';
    const tree = shallow(<Asset type="image" smartness={10} src={imgSrc} onLoad={() => {}} />);
    assert.equal(tree.prop('className'), 'spectrum-Asset');
    let asset = tree.find('AssetImage');
    assert.equal(asset.length, 1);
    assert.equal(asset.prop('smartness'), 10);
    assert.equal(typeof asset.prop('onLoad'), 'function');
  });

  it('should support AssetFolder when type is folder', () => {
    const tree = shallow(<Asset type="folder" />);
    assert.equal(tree.find('AssetFolder').length, 1);
  });

  it('should support custom classes', () => {
    const tree = shallow(<Asset className="my-class" />);
    assert.equal(tree.prop('className'), 'spectrum-Asset my-class');
  });
});
