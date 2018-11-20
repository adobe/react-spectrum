import assert from 'assert';
import {AssetImage} from '../../src/Asset';
import {mount} from 'enzyme';
import React from 'react';

describe('AssetImage', () => {
  // Square Image returns the Minimum Percentage, 75%
  it('should render the correct size when image is a square', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 240});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 240});
    
    const tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg" />
    );
        
    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    await new Promise(resolve => requestAnimationFrame(resolve));

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '75%', maxHeight: '75%'});
    tree.unmount();
  });

  // Images that have a width:height or height:width > 1:4 have maximum percentage, 100%
  it('should render the correct size when image ratio of sides is >= 1:4', async () => {
    // Jsdom doesn't implement size properties, so set the height and width of the image
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 100});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 400});
    
    const tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg" />
    );
        
    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    await new Promise(resolve => requestAnimationFrame(resolve));

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '100%', maxHeight: '100%'});
    tree.unmount();
  });

  it('should render the correct size when image is a horizontal rectangle', async () => {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 70});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 100});

    const tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg" />
    );
        
    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    await new Promise(resolve => requestAnimationFrame(resolve));

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '85%', maxHeight: '85%'});
    tree.unmount();
  });

  it('should render the correct size when input is a vertical rectangle', async () => {
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {get: () => true});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {get: () => 100});
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {get: () => 70});

    const tree = mount(
      <AssetImage
        src="https://t4.ftcdn.net/jpg/02/07/87/45/240_F_207874517_3oVZH5OJ399mo6FfLIyLGmu7ZJjsaqfU.jpg" />
    );
        
    let img = tree.find('img');
    img.simulate('load', {target: img.getDOMNode()});
    await new Promise(resolve => requestAnimationFrame(resolve));

    tree.update();
    img = tree.find('img');

    assert(img.getDOMNode().classList.contains('spectrum-Asset-image'));
    assert.deepEqual(img.prop('style'), {maxWidth: '85%', maxHeight: '85%'});
    tree.unmount();
  });
});
