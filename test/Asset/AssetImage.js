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
import {AssetImage} from '../../src/Asset';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('AssetImage', () => {
  let clock;
  let tree;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.runAll();
    if (tree) {
      tree.unmount();
      tree = null;
    }
    clock.restore();
  });
  // Square Image returns the Minimum Percentage, 75%
  it('should render the correct size when image is a square', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 240});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 240});

    const onLoad = sinon.spy();

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        decorative
        onLoad={onLoad} />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    assert(onLoad.called);

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '75%', maxHeight: '75%'});
  });

  it('should include alt text for accessibility', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 240});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 240});

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        alt="image" />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    tree.update();
    img = tree.find('img');

    assert.equal(img.prop('alt'), 'image');
  });

  it('should support decorative to hide element from screen readers', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 240});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 240});

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        alt="image"
        decorative />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    tree.update();
    img = tree.find('img');

    assert.equal(img.prop('alt'), '');
  });

  // Images that have a width:height or height:width > 1:4 have maximum percentage, 100%
  it('should render the correct size when image ratio of sides is >= 1:4', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 100});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 400});

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        decorative />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '100%', maxHeight: '100%'});
  });

  it('should render the correct size when image is a horizontal rectangle', async () => {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 70});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 100});

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        decorative />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '85%', maxHeight: '85%'});
  });

  it('should render the correct size when input is a vertical rectangle', async () => {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 100});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 70});

    tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg"
        decorative />
    );

    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    clock.runAll();

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '85%', maxHeight: '85%'});
  });
});
