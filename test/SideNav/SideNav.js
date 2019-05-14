import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {SideNav, SideNavItem} from '../../src/SideNav';
import sinon from 'sinon';

const render = (props = {}) => shallow(
  <SideNav {...props}>
    <SideNavItem value="Item 1" />
  </SideNav>
);

describe('SideNav', () => {
  it('renders a nav & ul with correct className', () => {
    let tree = render();
    assert.equal(tree.type(), 'nav');
    assert.equal(tree.find('FocusManager').find('ul').length, 1);
  });

  it('supports className as prop', () => {
    let tree = render({className: 'test-nav'});
    assert.equal(tree.find('.test-nav').length, 1);
  });

  it('multiLevel variant is supported', () => {
    let tree = render({variant: 'multiLevel'});
    assert.equal(tree.find('.spectrum-SideNav--multiLevel').length, 1);

    // Root multiLevel SideNav will be a nav element with role='tree'
    assert.equal(tree.type(), 'nav', 'Root multiLevel SideNav will be a nav element');
    assert.equal(tree.find('.spectrum-SideNav--multiLevel').prop('role'), 'tree', 'Root multiLevel SideNav will hav role="tree"');

    // Nested multiLevel SideNav will be a div element with role='group'
    tree.setProps({isNested: true});
    assert.equal(tree.type(), 'div', 'Nested multiLevel SideNav will be a div element');
    assert.equal(tree.find('.spectrum-SideNav--multiLevel').prop('role'), 'group', 'Nested multiLevel SideNav will have role="group"');
  });

  it('correct focusmanager selectors are set', () => {
    let tree = render();
    const focusManager = tree.find('FocusManager');
    assert.equal(focusManager.prop('itemSelector'), '.spectrum-SideNav-itemLink:not(.is-hidden):not(.is-disabled)');
    assert.equal(focusManager.prop('selectedItemSelector'), '.spectrum-SideNav-itemLink:not(.is-hidden):not(.is-disabled).is-selected');
    assert.equal(focusManager.find('.spectrum-SideNav').length, 1);
  });

  it('onSelect is triggered when clicked on any item', () => {
    const onSelect = sinon.spy();
    let tree = render({onSelect});
    tree.find(SideNavItem).last().simulate('select');
    assert(onSelect.calledOnce);
  });

  it('supports defaultValue', () => {
    let tree = render({defaultValue: 'Item 1'});
    assert(tree.instance().isDefaultSelected(tree.find(SideNavItem).get(0)));
  });

  it('supports value', () => {
    let tree = render();
    tree.setProps({value: 'Item 1'});
    assert.equal(tree.state('value'), 'Item 1');
  });

  it('supports nested nav value', () => {
    let tree = shallow(
      <SideNav variant="multiLevel" defaultValue="acrobat">
        <SideNavItem value="Item 1">Item 1</SideNavItem>
        <SideNavItem label="Nested">
          <SideNavItem value="dc" label="Document Cloud" defaultExpanded>
            <SideNavItem value="acrobat">Acrobat</SideNavItem>
            <SideNavItem value="sign">Adobe Sign</SideNavItem>
          </SideNavItem>
          <SideNavItem value="cc" label="Creative Cloud">
            <SideNavItem value="ps">Photoshop</SideNavItem>
            <SideNavItem value="il">Illustrator</SideNavItem>
          </SideNavItem>
        </SideNavItem>
      </SideNav>
    );
    assert(tree.instance().isDefaultSelected(tree.find(SideNavItem).get(3)));
    assert(tree.instance().isDefaultExpanded(tree.find(SideNavItem).get(2)));
  });
});
