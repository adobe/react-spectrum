import assert from 'assert';
import {AssetFile} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('AssetFile', () => {
  it('should display a File Icon', () => {
    const tree = shallow(<AssetFile className="my-class" />);
    assert(tree.find('.spectrum-Asset-file'), true);
    assert(tree.find('.my-class'), true);
  });
});
