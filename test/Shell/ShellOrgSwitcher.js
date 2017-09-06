import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {ShellOrganization, ShellOrgSwitcher} from '../../src/Shell';
import sinon from 'sinon';

const render = (props = {}) => (
  <ShellOrgSwitcher {...props}>
    <ShellOrganization name="foo" label="foo" />
    <ShellOrganization name="bar" label="bar" />
    <ShellOrganization name="baz" label="baz" />
  </ShellOrgSwitcher>
);

describe('ShellOrgSwitcher', () => {
  it('calls onOrgChange when a child in the list is selected', () => {
    const spy = sinon.spy();
    const tree = shallow(render({onOrgChange: spy}));
    tree.find('List').first().prop('onSelect')('test');
    assert.equal(spy.getCall(0).args[0], 'test');
  });

  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'foo'}));
    assert(tree.find('.coral3-Shell-orgSwitcher').prop('className').indexOf('foo') >= 0);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({foo: 'bar'}));
    assert.equal(tree.prop('foo'), 'bar');
  });
});
