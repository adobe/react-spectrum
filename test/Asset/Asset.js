/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {Asset} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('Asset', () => {
  it('should support AssetFile as the default content', () => {
    const tree = shallow(<Asset />);
    assert.equal(tree.find('AssetFile').length, 1);
  });

  describe('should support decorative to hide element from screen readers', () => {
    it('when type is file as the default content', () => {
      const tree = shallow(<Asset decorative />);
      assert.equal(tree.find('AssetFile').prop('decorative'), true);
      tree.setProps({decorative: false});
      tree.update();
      assert.equal(tree.find('AssetFile').prop('decorative'), false);
    });
    it('when type is image', () => {
      let imgSrc = 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03578.jpg';
      const tree = shallow(<Asset type="image" smartness={1} src={imgSrc} onLoad={() => {}} alt="image" decorative />);
      assert.equal(tree.find('AssetImage').prop('alt'), 'image');
      assert.equal(tree.find('AssetImage').prop('decorative'), true);
      tree.setProps({decorative: false});
      tree.update();
      assert.equal(tree.find('AssetImage').prop('decorative'), false);
    });
    it('when type is folder as the default content', () => {
      const tree = shallow(<Asset type="folder" decorative />);
      assert.equal(tree.find('AssetFolder').prop('decorative'), true);
      tree.setProps({decorative: false});
      tree.update();
      assert.equal(tree.find('AssetFolder').prop('decorative'), false);
    });
  });

  it('should support AssetImage when type is image', () => {
    let imgSrc = 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03578.jpg';
    const tree = shallow(<Asset type="image" smartness={1} src={imgSrc} onLoad={() => {}} alt="image" />);
    assert.equal(tree.prop('className'), 'spectrum-Asset');
    let asset = tree.find('AssetImage');
    assert.equal(asset.length, 1);
    assert.equal(asset.prop('smartness'), 1);
    assert.equal(typeof asset.prop('onLoad'), 'function');
    assert.equal(asset.prop('alt'), 'image');
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
