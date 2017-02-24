import React from 'react';
import expect, { createSpy } from 'expect';
import { shallow } from 'enzyme';
import Button from '../src/Button';
import Icon from '../src/Icon';

describe('Button', () => {
  it('supports different elements', () => {
    const tree = shallow(<Button />);
    expect(tree.type()).toBe('button');
    tree.setProps({ element: 'a' });
    expect(tree.type()).toBe('a');
    expect(tree.prop('role')).toBe('button');
    expect(tree.prop('tabIndex')).toBe(0);
  });

  it('supports different elements being disabled', () => {
    const onClickSpy = createSpy();
    const preventDefaultSpy = createSpy();

    const tree = shallow(<Button onClick={ onClickSpy } />);
    expect(tree.type()).toBe('button');
    tree.setProps({ element: 'a', href: 'http://example.com', disabled: true });
    expect(tree.type()).toBe('a');
    expect(tree.prop('tabIndex')).toBe(-1);
    expect(tree.prop('aria-disabled')).toBe(true);
    expect(tree.prop('className'))
      .toBe('coral-Button coral-Button--default coral-Button--medium is-disabled');

    tree.simulate('click', { preventDefault: preventDefaultSpy });
    expect(onClickSpy).toNotHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('supports different sizes', () => {
    const tree = shallow(<Button size="L" />);
    expect(tree.prop('className')).toBe('coral-Button coral-Button--default coral-Button--large');
  });

  it('supports different variants', () => {
    const tree = shallow(<Button variant="primary" />);
    expect(tree.prop('className')).toBe('coral-Button coral-Button--primary coral-Button--medium');
  });

  it('supports block', () => {
    const tree = shallow(<Button block />);
    expect(tree.prop('className'))
      .toBe('coral-Button coral-Button--default coral-Button--medium coral-Button--block');
  });

  it('supports square', () => {
    const tree = shallow(<Button square />);
    expect(tree.prop('className'))
      .toBe('coral-Button coral-Button--default coral-Button--medium coral-Button--square');
  });

  it('supports disabled', () => {
    const tree = shallow(<Button />);
    expect(tree.prop('disabled')).toNotExist();
    tree.setProps({ disabled: true });
    expect(tree.prop('disabled')).toBe(true);
  });

  it('supports selected', () => {
    const tree = shallow(<Button />);
    expect(tree.prop('className')).toBe('coral-Button coral-Button--default coral-Button--medium');
    tree.setProps({ selected: true });
    expect(tree.prop('className'))
      .toBe('coral-Button coral-Button--default coral-Button--medium is-selected');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Button className="myClass" />);
    expect(tree.prop('className'))
      .toBe('coral-Button coral-Button--default coral-Button--medium myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Button foo>My Heading</Button>);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(<Button><div>My Custom Content</div></Button>);
    const child = tree.find('div');
    expect(child.length).toBe(1);
    expect(child.children().node).toBe('My Custom Content');
  });

  it('can be clicked', () => {
    const spy = createSpy();
    const tree = shallow(<Button onClick={ spy } />);
    tree.simulate('click');
    expect(spy).toHaveBeenCalled();
  });

  describe('icon', () => {
    it('doesn\'t render an icon by default', () => {
      const tree = shallow(<Button />);
      expect(tree.find(Icon).length).toBe(0);
    });

    it('supports different icons', () => {
      const tree = shallow(<Button icon="bell" />);
      expect(tree.find(Icon).prop('icon')).toBe('bell');
      expect(tree.find(Icon).prop('size')).toBe('S');
    });

    it('supports different sizes', () => {
      const tree = shallow(<Button icon="bell" iconSize="L" />);
      expect(tree.find(Icon).prop('size')).toBe('L');
    });
  });

  describe('label', () => {
    it('doesn\'t render a label by default', () => {
      const tree = shallow(<Button />);
      expect(tree.find('.coral-Button-label').children().node).toNotExist();
    });

    it('supports label text', () => {
      const tree = shallow(<Button label="My Label" />);
      expect(tree.find('.coral-Button-label').children().node).toBe('My Label');
    });
  });
});
