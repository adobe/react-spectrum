import assert from 'assert';
import Bell from '../../src/Icon/Bell';
import {cloneIcon} from '../../src/utils/icon';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('cloneIcon', () => {
  it('clones an Icon ', () => {
    let tree = shallow(cloneIcon(<Bell />));
    assert.equal(tree.type(), Icon);
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.dive().find('svg').prop('aria-hidden'), true);
  });

  it('throws error if icon parameter is a string ', () => {
    assert.throws(() => cloneIcon('Bell'), 'Error: String icon names are deprecated. Pass icons by importing them from react-spectrum/Icon/IconName and render as <IconName />.');
  });

  it('retains alt prop on icon', () => {
    let tree = shallow(cloneIcon(<Bell alt="foo" />));
    assert.equal(tree.prop('alt'), 'foo');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'foo');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));
  });

  it('retains aria-label prop on icon', () => {
    let tree = shallow(cloneIcon(<Bell aria-label="foo" />));
    assert.equal(tree.prop('aria-label'), 'foo');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'foo');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));
  });

  it('retains size prop on icon', () => {
    let tree = shallow(cloneIcon(<Bell size="S" />));
    assert.equal(tree.prop('size'), 'S');
  });

  it('retains aria-hidden prop on icon', () => {
    let tree = shallow(cloneIcon(<Bell alt="foo" aria-hidden />));
    assert.equal(tree.prop('alt'), 'foo');
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'foo');
    assert.equal(tree.dive().find('svg').prop('aria-hidden'), true);
  });

  it('supports overriding aria-label prop', () => {
    let tree = shallow(cloneIcon(<Bell aria-label="foo" />, {'aria-label': 'bar'}));
    assert.equal(tree.prop('alt'), 'bar');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'bar');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));

    tree = shallow(cloneIcon(<Bell alt="foo" />, {'aria-label': 'bar'}));
    assert.equal(tree.prop('alt'), 'bar');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'bar');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));
  });

  it('supports overriding alt prop', () => {
    let tree = shallow(cloneIcon(<Bell aria-label="foo" />, {alt: 'bar'}));
    assert.equal(tree.prop('alt'), 'bar');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'bar');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));

    tree = shallow(cloneIcon(<Bell alt="foo" />, {alt: 'bar'}));
    assert.equal(tree.prop('alt'), 'bar');
    assert.ifError(tree.prop('aria-hidden'));
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'bar');
    assert.ifError(tree.dive().find('svg').prop('aria-hidden'));
  });

  it('does not override size prop set on icon', () => {
    let tree = shallow(cloneIcon(<Bell size="L" />, {size: 'S'}));
    assert.equal(tree.prop('size'), 'L');
  });

  it('supports overriding aria-hidden prop on icon', () => {
    let tree = shallow(cloneIcon(<Bell alt="foo" />, {'aria-hidden': true}));
    assert.equal(tree.prop('alt'), 'foo');
    assert.equal(tree.prop('aria-hidden'), true);
    assert.equal(tree.dive().find('svg').prop('aria-label'), 'foo');
    assert.equal(tree.dive().find('svg').prop('aria-hidden'), true);
  });
});
