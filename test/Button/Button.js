import assert from 'assert';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import React from 'react';
import {shallow} from 'enzyme';
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
    assert.equal(tree.prop('tabIndex'), -1);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--default is-disabled');

    tree.simulate('click', {preventDefault: preventDefaultSpy});
    assert(!onClickSpy.called);
    assert(preventDefaultSpy.called);
  });

  it('supports different variants', () => {
    const tree = shallow(<Button variant="primary" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--primary');
  });

  it('supports block', () => {
    const tree = shallow(<Button block />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--default spectrum-Button--block');
  });

  it('supports disabled', () => {
    const tree = shallow(<Button />);
    assert(!tree.prop('disabled'));
    tree.setProps({disabled: true});
    assert.equal(tree.prop('disabled'), true);
  });

  it('supports selected', () => {
    const tree = shallow(<Button />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--default');
    tree.setProps({selected: true});
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--default is-selected');
  });

  it('supports quiet', () => {
    const tree = shallow(<Button quiet variant="primary" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--quiet--primary');
  });

  it('supports logic', () => {
    const tree = shallow(<Button logic variant="and" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--logic--and');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Button className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Button spectrum-Button--default myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Button foo>My Heading</Button>);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Button><div>My Custom Content</div></Button>);
    const child = tree.find('div');
    assert.equal(child.length, 1);
    assert.equal(child.children().node, 'My Custom Content');
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
      assert(!tree.children().last().node);
    });

    it('supports label text', () => {
      const tree = shallow(<Button label="My Label" />);
      assert.equal(tree.find('.spectrum-Button-label').children().last().node, 'My Label');
    });
  });
});
