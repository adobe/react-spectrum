import assert from 'assert';
import Link from '../../src/Link';
import React from 'react';
import {shallow} from 'enzyme';

describe('Link', () => {
  it('supports the quiet variation', () => {
    const tree = shallow(<Link variant="quiet" className="myClass">Testing</Link>);
    assert(tree.prop('className').indexOf('spectrum-Link--quiet') >= 0);
    
    // deprecated subtle prop should still work
    tree.setProps({subtle: true, variant: null});

    assert(tree.prop('className').indexOf('spectrum-Link--quiet') >= 0);
  });

  it('supports the overBackground variation', () => {
    const tree = shallow(<Link variant="overBackground" className="myClass">Testing</Link>);
    assert(tree.prop('className').indexOf('spectrum-Link--overBackground') >= 0);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Link className="myClass">Testing</Link>);
    assert(tree.prop('className').indexOf('myClass') >= 0);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Link aria-foo>My Link</Link>);
    assert.equal(tree.prop('aria-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Link>My Link</Link>);
    assert.equal(tree.childAt(0).text(), 'My Link');
  });
});
