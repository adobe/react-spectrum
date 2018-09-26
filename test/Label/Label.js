import assert from 'assert';
import Label from '../../src/Label';
import React from 'react';
import {shallow} from 'enzyme';

describe('Label', () => {
  it('supports the large size', () => {
    const tree = shallow(<Label size="L">Testing</Label>);
    assert(tree.hasClass('spectrum-Label--large'));
  });

  it('supports variants, default grey', () => {
    let tree = shallow(<Label variant="red">Testing</Label>);
    assert(tree.hasClass('spectrum-Label--red'));

    tree = shallow(<Label>Testing</Label>);
    assert(tree.hasClass('spectrum-Label--grey'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Label className="myClass">Testing</Label>);
    assert(tree.hasClass('myClass'));
    assert(tree.hasClass('spectrum-Label'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<Label data-foo>Testing</Label>);
    assert.equal(tree.prop('data-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Label>My Link</Label>);
    assert.equal(tree.childAt(0).text(), 'My Link');
  });
});
