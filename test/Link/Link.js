import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import Link from '../../src/Link';

describe('Link', () => {
  it('supports the subtle variation', () => {
    const tree = shallow(<Link subtle className="myClass">Testing</Link>);
    assert(tree.prop('className').indexOf('coral-Link--subtle') >= 0);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Link className="myClass">Testing</Link>);
    assert(tree.prop('className').indexOf('myClass') >= 0);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Link foo>My Link</Link>);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Link>My Link</Link>);
    assert.equal(tree.children().node, 'My Link');
  });
});
