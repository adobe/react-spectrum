import assert from 'assert';
import Avatar from '../../src/Avatar';
import React from 'react';
import {shallow} from 'enzyme';

describe('Avatar', function () {
  it('should render an avatar image', function () {
    let tree = shallow(<Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" alt="Avatar" />);
    assert.equal(tree.type(), 'img');
    assert.equal(tree.prop('className'), 'spectrum-Avatar');
    assert.equal(tree.prop('src'), 'https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg');
    assert.equal(tree.prop('alt'), 'Avatar');
  });

  it('should render a disabled avatar', function () {
    let tree = shallow(<Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" disabled />);
    assert.equal(tree.prop('className'), 'spectrum-Avatar is-disabled');
  });

  it('should support custom classes', function () {
    let tree = shallow(<Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" className="my-class" />);
    assert.equal(tree.prop('className'), 'spectrum-Avatar my-class');
  });

  it('should support other DOM props', function () {
    let tree = shallow(<Avatar src="https://git.corp.adobe.com/pages/Spectrum/spectrum-css/docs/img/example-ava.jpg" aria-label="Avatar" />);
    assert.equal(tree.prop('aria-label'), 'Avatar');
  });
});
