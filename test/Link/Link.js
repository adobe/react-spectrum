import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Link from '../../src/Link';

describe('Link', () => {
  it('supports the subtle variation', () => {
    const tree = shallow(<Link subtle className="myClass">Testing</Link>);
    expect(tree.prop('className')).toInclude('coral-Link--subtle');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Link className="myClass">Testing</Link>);
    expect(tree.prop('className')).toInclude('myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Link foo>My Link</Link>);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(<Link>My Link</Link>);
    expect(tree.children().node).toBe('My Link');
  });
});
