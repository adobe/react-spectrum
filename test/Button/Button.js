import assert from 'assert';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Button', () => {
  it('supports different elements', () => {
    const tree = shallow(<Button />);
    assert.equal(tree.type(), 'button');
    tree.setProps({element: 'a'});
    assert.equal(tree.type(), 'a');
    assert.equal(tree.prop('role'), 'button');
    assert.equal(tree.prop('tabIndex'), 0);
  });

  it('supports different elements being disabled', () => {
    const onClickSpy = sinon.spy();
    const preventDefaultSpy = sinon.spy();

    const tree = shallow(<Button onClick={onClickSpy} />);
    assert.equal(tree.type(), 'button');
    tree.setProps({element: 'a', href: 'http://example.com', disabled: true});
    assert.equal(tree.type(), 'a');
    assert.equal(tree.prop('href'), undefined);
    assert.equal(tree.prop('tabIndex'), undefined);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--secondary is-disabled');

    tree.simulate('click', {preventDefault: preventDefaultSpy});
    assert(!onClickSpy.called);
    assert(preventDefaultSpy.called);
  });

  it('support different element activation using the Space or Enter key', () => {
    const onClickSpy = sinon.spy();
    const preventDefaultSpy = sinon.spy();
    const tree = shallow(<Button element="a" onClick={onClickSpy} />);
    const instance = tree.instance();
    instance.buttonRef = {
      click: () => instance.onClick({preventDefault: preventDefaultSpy})
    };
    tree.simulate('keyDown', {key: 'Esc', preventDefault: preventDefaultSpy});
    assert(!onClickSpy.called);
    assert(!preventDefaultSpy.called);
    tree.simulate('keyDown', {key: ' ', preventDefault: preventDefaultSpy});
    assert(onClickSpy.callCount, 1);
    assert(preventDefaultSpy.callCount, 2);
    tree.simulate('keyDown', {key: 'Enter', preventDefault: preventDefaultSpy});
    assert(onClickSpy.callCount, 2);
    assert(preventDefaultSpy.callCount, 4);
  });

  it('supports different variants', () => {
    let tree = shallow(<Button variant="primary" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--primary');
    tree = shallow(<Button variant="action" />);
    assert.equal(tree.prop('className'), 'spectrum-ActionButton');
    tree = shallow(<Button variant="toggle" />);
    assert.equal(tree.prop('className'), 'spectrum-ActionButton spectrum-ActionButton--quiet');
    tree = shallow(<Button variant="tool" />);
    assert.equal(tree.prop('className'), 'spectrum-Tool');
    tree = shallow(<Button variant="quiet" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--quiet spectrum-Button--primary');
    tree = shallow(<Button variant="minimal" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--quiet spectrum-Button--secondary');
    tree = shallow(<Button variant="icon" />);
    assert.equal(tree.prop('className'), 'spectrum-ActionButton spectrum-ActionButton--quiet');
  });

  it('supports block', () => {
    const tree = shallow(<Button block />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--secondary spectrum-Button--block');
  });

  it('supports disabled', () => {
    const tree = shallow(<Button />);
    assert(!tree.prop('disabled'));
    tree.setProps({disabled: true});
    assert.equal(tree.prop('disabled'), true);
  });

  it('supports selected', () => {
    const tree = shallow(<Button />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--secondary');
    tree.setProps({selected: true});
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--secondary is-selected');
  });

  describe('supports aria-expanded', () => {
    it('when aria-haspopup is true', () => {
      const tree = shallow(<Button aria-haspopup />);
      assert.equal(tree.prop('aria-expanded'), null);
      tree.setProps({selected: true});
      assert.equal(tree.prop('aria-expanded'), true);
    });

    it('when prop is explicitly set', () => {
      const tree = shallow(<Button aria-expanded />);
      assert.equal(tree.prop('aria-expanded'), true);
      tree.setProps({'aria-expanded': false});
      assert.equal(tree.prop('aria-expanded'), false);
    });
  });

  it('supports quiet', () => {
    const tree = shallow(<Button quiet variant="primary" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--quiet spectrum-Button--primary');
  });

  it('supports logic', () => {
    const tree = shallow(<Button logic variant="and" />);
    assert.equal(tree.prop('className'), 'spectrum-LogicButton spectrum-LogicButton--and');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Button className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--secondary myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Button data-foo>My Heading</Button>);
    assert.equal(tree.prop('data-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Button><div>My Custom Content</div></Button>);
    const child = tree.find('div');
    assert.equal(child.length, 1);
    assert.equal(child.children().text(), 'My Custom Content');
  });

  it('can be clicked', () => {
    const spy = sinon.spy();
    const tree = shallow(<Button onClick={spy} />);
    tree.simulate('click');
    assert(spy.called);
  });

  describe('icon', () => {
    it('supports different icons', () => {
      const tree = shallow(<Button icon={<Bell />} />);
      assert.equal(tree.find(Bell).length, 1);
      assert.equal(tree.find(Bell).prop('size'), 'S');
    });

    it('supports different sizes', () => {
      const tree = shallow(<Button icon={<Bell size="L" />} />);
      assert.equal(tree.find(Bell).prop('size'), 'L');
    });
  });

  describe('label', () => {
    it('doesn\'t render a label by default', () => {
      const tree = shallow(<Button />);
      assert(!tree.children().last().text());
    });

    it('supports label text', () => {
      const tree = shallow(<Button label="My Label" />);
      assert.equal(tree.find('.spectrum-Button-label').children().last().text(), 'My Label');
    });
  });
  describe('tool', () => {
    it('supports holdAffordance', () => {
      const tree = shallow(<Button variant="tool" holdAffordance />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 1);
    });
    it('doesn\'t render a holdAffordance by default', () => {
      const tree = shallow(<Button variant="tool" />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 0);
    });
    it('doesn\'t render a holdAffordance when not a tool variant', () => {
      const tree = shallow(<Button variant="primary" holdAffordance />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 0);
    });
  });
  describe('action', () => {
    it('supports holdAffordance', () => {
      const tree = shallow(<Button variant="action" holdAffordance />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 1);
    });
    it('doesn\'t render a holdAffordance by default', () => {
      const tree = shallow(<Button variant="action" />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 0);
    });
    it('toggle supports holdAffordance', () => {
      const tree = shallow(<Button variant="toggle" holdAffordance />);
      assert.equal(tree.find('.spectrum-Tool-hold').length, 1);
    });
  });

  describe('', () => {
    let clock;
    let tree;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      if (tree) {
        tree.unmount();
        tree = null;
      }
      clock.restore();
    });
    it('supports focus method', async () => {
      tree = mount(<Button />);
      tree.instance().focus();
      assert.equal(document.activeElement, tree.getDOMNode());
    });

    it('supports autoFocus', () => {
      tree = mount(<Button autoFocus />);
      assert(!tree.getDOMNode().getAttribute('autoFocus'));
      clock.runAll(); // there's a raf, so run the clock to fire it
      assert.equal(document.activeElement, tree.getDOMNode());
    });
  });

  describe('receives focus', () => {
    let tree;
    const focusSpy = sinon.spy();
    const mouseDownSpy = sinon.spy();
    const mouseUpSpy = sinon.spy();
    before(() => {
      tree = shallow(<Button />);
      tree.instance().buttonRef = {
        focus: focusSpy
      };
    });

    afterEach(() => {
      focusSpy.resetHistory();
      mouseDownSpy.resetHistory();
      mouseUpSpy.resetHistory();
    });

    after(() => tree.unmount());

    it('on mouse down', () => {
      tree.simulate('mouseDown', {type: 'mousedown'});
      assert.equal(focusSpy.callCount, 1);
      focusSpy.resetHistory();
      tree.setProps({onMouseDown: e => mouseDownSpy(e)});
      tree.simulate('mouseDown', {type: 'mousedown', isDefaultPrevented: () => true});
      tree.simulate('mouseUp', {type: 'mouseup'});
      assert.equal(focusSpy.callCount, 0);
      assert.equal(mouseDownSpy.callCount, 1);
      focusSpy.resetHistory();
      mouseDownSpy.resetHistory();
      tree.setProps({onMouseDown: e => mouseDownSpy(e)});
      tree.simulate('mouseDown', {type: 'mousedown', isDefaultPrevented: () => false});
      assert.equal(focusSpy.callCount, 1);
      assert.equal(mouseDownSpy.callCount, 1);
    });

    it('on mouse up', () => {
      tree.simulate('mouseUp', {type: 'mouseup'});
      assert.equal(focusSpy.callCount, 1);
      focusSpy.resetHistory();
      tree.setProps({onMouseUp: e => mouseUpSpy(e)});
      tree.simulate('mouseUp', {type: 'mouseup', isDefaultPrevented: () => true});
      assert.equal(focusSpy.callCount, 0);
      assert.equal(mouseUpSpy.callCount, 1);
      focusSpy.resetHistory();
      mouseUpSpy.resetHistory();
      tree.setProps({onMouseUp: e => mouseUpSpy(e)});
      tree.simulate('mouseUp', {type: 'mouseup', isDefaultPrevented: () => false});
      assert.equal(focusSpy.callCount, 1);
      assert.equal(mouseUpSpy.callCount, 1);
    });
  });

  describe('focus change following mouse event', () => {
    let tree;
    const mouseDownButton0Spy = sinon.spy();
    const mouseDownButton1Spy = sinon.spy();
    const mouseUpButton0Spy = sinon.spy();
    const mouseUpButton1Spy = sinon.spy();
    let shiftFocusOnMouseUp = false;
    before(() => {
      tree = mount(<div>
        <Button
          label="Focus next button"
          onMouseDown={(e) => {
            !shiftFocusOnMouseUp && findButtons(tree).last().getDOMNode().focus();
            e.preventDefault();
            mouseDownButton0Spy(e);
          }}
          onMouseUp={(e) => {
            shiftFocusOnMouseUp && findButtons(tree).last().getDOMNode().focus();
            e.preventDefault();
            mouseUpButton0Spy(e);
          }} />
        <Button
          label="Focus previous button"
          onMouseDown={(e) => {
            !shiftFocusOnMouseUp && findButtons(tree).first().getDOMNode().focus();
            e.preventDefault();
            mouseDownButton1Spy(e);
          }}
          onMouseUp={(e) => {
            shiftFocusOnMouseUp && findButtons(tree).first().getDOMNode().focus();
            e.preventDefault();
            mouseUpButton1Spy(e);
          }} />
      </div>);
    });

    beforeEach(() => {
      mouseDownButton0Spy.resetHistory();
      mouseUpButton0Spy.resetHistory();
      mouseDownButton1Spy.resetHistory();
      mouseUpButton1Spy.resetHistory();
    });

    after(() => {
      tree.unmount();
    });

    it('on mouse down', () => {
      findButtons(tree).first().simulate('mousedown', {type: 'mousedown'});
      assert.equal(mouseDownButton0Spy.callCount, 1);
      findButtons(tree).first().simulate('mouseup', {type: 'mouseup'});
      assert.equal(mouseUpButton0Spy.callCount, 1);
      assert.equal(document.activeElement, findButtons(tree).last().getDOMNode());

      findButtons(tree).last().simulate('mousedown', {type: 'mousedown'});
      assert.equal(mouseDownButton1Spy.callCount, 1);
      findButtons(tree).last().simulate('mouseup', {type: 'mouseup'});
      assert.equal(mouseUpButton1Spy.callCount, 1);
      assert.equal(document.activeElement, findButtons(tree).first().getDOMNode());
    });

    it('on mouse up', () => {
      shiftFocusOnMouseUp = true;
      findButtons(tree).first().simulate('mousedown', {type: 'mousedown'});
      assert.equal(mouseDownButton0Spy.callCount, 1);
      findButtons(tree).first().simulate('mouseup', {type: 'mouseup'});
      assert.equal(mouseUpButton0Spy.callCount, 1);
      assert.equal(document.activeElement, findButtons(tree).last().getDOMNode());

      findButtons(tree).last().simulate('mousedown', {type: 'mousedown'});
      assert.equal(mouseDownButton1Spy.callCount, 1);
      findButtons(tree).last().simulate('mouseup', {type: 'mouseup'});
      assert.equal(mouseUpButton1Spy.callCount, 1);
      assert.equal(document.activeElement, findButtons(tree).first().getDOMNode());
    });
  });
});

const findButtons = tree => tree.find(Button);
