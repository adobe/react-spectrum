import assert from 'assert';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('Icon', () => {
  it('supports icons', () => {
    const tree = shallow(<Icon icon="bell" />);
    assert.equal(tree.prop('className'), 'coral-Icon coral-Icon--sizeM coral-Icon--bell');
    assert.equal(tree.type(), 'span');
  });

  it('supports color icons', () => {
    const tree = shallow(<Icon icon="twitterColor" />);
    assert.equal(tree.prop('className'), 'coral-Icon coral-Icon--sizeM coral-Icon--twitterColor coral-ColorIcon');
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Icon icon="bell" size="L" />);
    assert.equal(tree.prop('className'), 'coral-Icon coral-Icon--sizeL coral-Icon--bell');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Icon icon="bell" className="myClass" />);
    assert.equal(tree.prop('className'), 'coral-Icon coral-Icon--sizeM coral-Icon--bell myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Icon icon="bell" foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
