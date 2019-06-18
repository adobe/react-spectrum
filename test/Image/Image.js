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
import {Image, ImageCache} from '../../src/Image';
import {rAF} from '../utils';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Image', () => {
  afterEach(() => {
    if (ImageCache.get.restore) {
      ImageCache.get.restore();
    }

    ImageCache._cache.clear();
  });

  it('should render an image', () => {
    let tree = shallow(<Image src="image.jpg" decorative />);
    assert.equal(tree.type(), 'img');
    assert.equal(tree.prop('className'), 'react-spectrum-Image');
    assert.equal(tree.prop('src'), 'image.jpg');
    assert.equal(tree.prop('alt'), '');
  });

  it('should pass through additional DOM props', () => {
    let tree = shallow(<Image src="image.jpg" alt="image" />);
    assert.equal(tree.prop('alt'), 'image');
  });

  it('should hide decorative image from assitive technology', () => {
    let tree = shallow(<Image src="image.jpg" alt="image" decorative />);
    assert.equal(tree.prop('alt'), '');
    tree.setProps({decorative: false});
    assert.equal(tree.prop('alt'), 'image');
  });

  it('should trigger onLoad', async () => {
    let onLoad = sinon.spy();
    let tree = shallow(<Image src="image.jpg" onLoad={onLoad} alt="image" />);

    tree.instance().imgRef = {complete: true, naturalWidth: 100, naturalHeight: 100};
    tree.simulate('load');

    await rAF();
    assert(onLoad.called);
  });

  it('should load an image using the cache', () => {
    sinon.stub(ImageCache, 'get').callsArgWith(2, null, 'blob:bar');
    let tree = shallow(<Image src="image.jpg" cache alt="image" />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image');
    assert.equal(tree.prop('src'), 'blob:bar');
  });

  it('should set is-loaded class when loaded', async () => {
    sinon.stub(ImageCache, 'get').callsArgWith(2, null, 'blob:bar');
    let onLoad = sinon.spy();
    let tree = shallow(<Image src="image.jpg" cache onLoad={onLoad} alt="image" />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image');

    tree.instance().imgRef = {complete: true, naturalWidth: 100, naturalHeight: 100};
    tree.simulate('load');

    await rAF();
    assert(onLoad.called);

    tree.update();
    assert.equal(tree.prop('className'), 'react-spectrum-Image is-loaded');
  });

  it('should load a pre-cached image', () => {
    ImageCache.set('image.jpg', 'blob:foo');
    let tree = shallow(<Image src="image.jpg" cache alt="image" />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image is-loaded');
    assert.equal(tree.prop('src'), 'blob:foo');
  });

  it('should show a placeholder image when cached already', async () => {
    // this test relies way too much on the internals, but i can't think of something better right now
    let resolver = null;
    let imgCachePromise = new Promise(resolve => resolver = resolve);
    sinon.stub(ImageCache, 'get').callsFake((foo, bar, callback) => {
      imgCachePromise.then(() => {
        callback(null, 'blob:bar');
      });
    });
    ImageCache.set('placeholder.jpg', 'blob:placeholder');
    let tree = shallow(<Image src="image.jpg" placeholder="placeholder.jpg" cache decorative />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image is-placeholder');
    assert.equal(tree.prop('src'), 'blob:placeholder');

    tree.instance().imgRef = {complete: true, naturalWidth: 100, naturalHeight: 100};
    tree.simulate('load');
    await rAF();
    tree.update();
    let setStateSpy = sinon.stub(tree.instance(), 'setState').callThrough();
    resolver();
    await imgCachePromise;
    // in enzyme for 15 weirdness happens and the img ref is lost on renders
    // so instead of relying on the component output after,
    // check what the state was set to
    sinon.assert.calledWith(setStateSpy, {
      src: 'blob:bar',
      loaded: false,
      isPlaceholder: false
    });
  });

  it('should update the image when the src prop changes', async () => {
    ImageCache.set('image1.jpg', 'blob:one');
    ImageCache.set('image2.jpg', 'blob:two');
    let tree = shallow(<Image src="image1.jpg" cache alt="image" />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image is-loaded');
    assert.equal(tree.prop('src'), 'blob:one');

    tree.setProps({src: 'image2.jpg'});
    assert.equal(tree.prop('src'), 'blob:two');
  });

  it('should reset the state on error', async () => {
    ImageCache.set('image1.jpg', 'blob:one');

    let onError = sinon.spy();
    let tree = shallow(<Image src="image1.jpg" cache onError={onError} alt="image" />);
    assert.equal(tree.prop('className'), 'react-spectrum-Image is-loaded');
    assert.equal(tree.prop('src'), 'blob:one');

    sinon.stub(ImageCache, 'get').callsArgWith(2, 'error');

    tree.setProps({src: 'image2.jpg'});
    assert.equal(tree.prop('className'), 'react-spectrum-Image');
    assert.equal(tree.prop('src'), '');
    assert(onError.called);
  });
});
