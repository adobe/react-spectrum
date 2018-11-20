import assert from 'assert';
import {AssetFolder} from '../../src/Asset';
import React from 'react';
import {shallow} from 'enzyme';

describe('AssetFolder', () => {
  it('should display a Folder Icon', () => {
    const tree = shallow(<AssetFolder className="my-class" />);
    assert(tree.find('.spectrum-Asset-folder'), true);
    assert(tree.find('.my-class'), true);
  });
});
