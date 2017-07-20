import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import PortalContainer from '../../src/PortalContainer';

describe('PortalContainer', () => {
  it('should render children', () => {
    let tree = shallow(<PortalContainer />);
    assert.equal(tree.children().length, 0);

    let child = <div key="test">test</div>;
    tree.instance().add(child);
    assert.equal(tree.children().length, 1);
    assert.equal(tree.childAt(0).text(), 'test');

    let child2 = <div key="test2">test2</div>;
    tree.instance().add(child2);
    assert.equal(tree.children().length, 2);
    assert.equal(tree.childAt(0).text(), 'test');
    assert.equal(tree.childAt(1).text(), 'test2');

    // update child
    child = <div key="test">testing</div>;
    tree.instance().add(child);
    assert.equal(tree.children().length, 2);
    assert.equal(tree.childAt(0).text(), 'testing');
    assert.equal(tree.childAt(1).text(), 'test2');

    tree.instance().remove(child);
    assert.equal(tree.children().length, 1);
  });

  it('should render a global PortalContainer', async () => {
    let child = <div id="portal-test">test</div>;
    PortalContainer.add(child);

    let node = document.querySelector('#portal-test');
    assert(node);
    assert(document.body.contains(node));

    PortalContainer.remove(child);
    assert(!document.querySelector('#portal-test'));
  });
});
