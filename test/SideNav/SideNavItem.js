import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {SideNav, SideNavItem} from '../../src/SideNav';
import sinon from 'sinon';

const render = (props = {}) => shallow(<SideNavItem {...props} />);
const NOOP = () => {};

describe('SideNavItem', () => {
  it('renders a li with correct className', () => {
    let tree = render();
    assert.equal(tree.type(), 'li');
    assert.equal(tree.find('.spectrum-SideNav-item').length, 1);
  });

  it('supports className as prop', () => {
    let tree = render({className: 'test-nav-item'});
    assert.equal(tree.find('.test-nav-item').length, 1);
  });

  it('supports extra props', () => {
    let tree = render({'aria-custom': 'value'});
    assert.equal(tree.find('li').prop('aria-custom'), 'value');
  });

  it('supports updating props', () => {
    let tree = render();
    assert.equal(tree.state('expanded'), undefined);
    tree.setProps({expanded: true});
    assert.equal(tree.state('expanded'), true);
  });

  it('supports disabled prop', () => {
    let tree = render({label: 'Item label', disabled: true});
    let link = tree.find('.spectrum-SideNav-itemLink');
    assert.equal(link.prop('href'), undefined);
    assert.equal(link.prop('onClick'), undefined);
    assert.equal(link.prop('onFocus'), undefined);
    assert.equal(link.prop('onBlur'), undefined);
    assert.equal(link.prop('tabIndex'), undefined);
    assert.equal(link.prop('aria-disabled'), true);
  });

  it('label is shown correctly via label prop', () => {
    let tree = render({label: 'Item label'});
    assert.equal(tree.find('a').prop('children'), 'Item label');
  });

  it('label is shown correctly when passed as children', () => {
    let tree = render({children: 'Item label'});
    assert.equal(tree.find('a').prop('children'), 'Item label');
  });

  it('renders correct class in case of an header item', () => {
    let tree = render({header: 'Item label'});
    assert.equal(tree.find('.spectrum-SideNav-heading').length, 1);
    assert.equal(tree.find('.spectrum-SideNav-itemLink').length, 0);
  });

  it('onSelect is called when clicked on any item', () => {
    const onSelect = sinon.spy();
    let tree = render({onSelect, label: 'a'});
    tree.find('.spectrum-SideNav-itemLink').simulate('click', {preventDefault: NOOP, stopPropagation: NOOP});
    assert(onSelect.calledOnce);
  });

  it('renders a nested sidenav', () => {
    let tree = shallow(
      <SideNavItem label="Nested">
        <SideNavItem value="dc">Document Clouds</SideNavItem>
        <SideNavItem value="cc">Creative Cloud</SideNavItem>
      </SideNavItem>
    );
    assert.equal(tree.find(SideNav).length, 1);
  });

  describe('Accessibility', () => {
    let tree;
    beforeEach(() => {
      tree = mount(
        <SideNavItem label="Nested" role="treeitem" _nestedNavValue="dc">
          <SideNavItem value="dc" _isSelected>Document Clouds</SideNavItem>
          <SideNavItem value="cc">Creative Cloud</SideNavItem>
        </SideNavItem>
      );
    });
    afterEach(() => {
      tree.unmount();
    });
    describe('ArrowRight', () => {
      it('expands collapsed item', () => {
        tree.setState({expanded: false});
        assert.equal(tree.state('expanded'), false);
        tree.find('.spectrum-SideNav-itemLink').first().simulate('keydown', {key: 'ArrowRight', preventDefault: NOOP, stopPropagation: NOOP});
        assert.equal(tree.state('expanded'), true);
        tree.find('.spectrum-SideNav-itemLink').first().simulate('keydown', {key: 'ArrowRight', preventDefault: NOOP, stopPropagation: NOOP});
        assert.equal(tree.find('.spectrum-SideNav-itemLink').at(1).getDOMNode(), document.activeElement);
      });
    });
    describe('ArrowLeft', () => {
      it('closes expanded item', () => {
        tree.setState({expanded: true});
        assert.equal(tree.state('expanded'), true);
        tree.find('.spectrum-SideNav-itemLink[aria-current]').simulate('keydown', {key: 'ArrowLeft', preventDefault: NOOP, stopPropagation: NOOP});
        assert.equal(tree.state('expanded'), false);
        assert.equal(tree.find('.spectrum-SideNav-itemLink').first().getDOMNode(), document.activeElement);
      });
    });
    describe('Enter/Space', () => {
      it('should click focused item', () => {
        tree.setState({expanded: true});
        assert.equal(tree.state('expanded'), true);
        let clickSpy = sinon.spy();
        tree.find('.spectrum-SideNav-itemLink').last().simulate('keydown', {target: {click: clickSpy}, key: 'Enter', preventDefault: NOOP, stopPropagation: NOOP});
        assert(clickSpy.called);
        tree.find('.spectrum-SideNav-itemLink').last().simulate('keydown', {target: {click: clickSpy}, key: 'Space', preventDefault: NOOP, stopPropagation: NOOP});
        assert(clickSpy.calledTwice);
      });
    });
    describe('onFocus', () => {
      it('sets focused state to true', () => {
        assert.equal(tree.state('focused'), false);
        tree.find('.spectrum-SideNav-itemLink').first().simulate('focus');
        assert.equal(tree.state('focused'), true);
      });
    });
    describe('onBlur', () => {
      it('sets focused state to false', () => {
        tree.setState({focused: true});
        tree.find('.spectrum-SideNav-itemLink').first().simulate('blur');
        assert.equal(tree.state('focused'), false);
      });
    });

    describe('onSelect', () => {
      it('calls onSelect when a nested nav item is selected', () => {
        let onSelect = sinon.spy();
        tree.setProps({onSelect, expanded: true});
        tree.find('.spectrum-SideNav-itemLink').last().simulate('click');
        tree.update();
        assert(onSelect.calledOnce);
      });
    });
  });
});
