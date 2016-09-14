import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Tag from '../src/Tag';

describe('Tag', () => {
  it('default', () => {
    const tree = shallow(<Tag />);
    expect(tree.prop('tabIndex')).toBe(-1);
    expect(tree.prop('aria-selected')).toBe(false);
    expect(tree.prop('aria-label')).toBe('Remove label');
    expect(tree.hasClass('coral-Tag')).toBe(true);
    expect(tree.hasClass('coral-Tag--large')).toBe(true);
    expect(tree.hasClass('coral-Tag--grey')).toBe(true);
  });

  it('supports size', () => {
    const tree = shallow(<Tag size="M" />);
    expect(tree.prop('className')).toInclude('coral-Tag--medium');
  });

  it('supports color', () => {
    const tree = shallow(<Tag color="green" />);
    expect(tree.prop('className')).toInclude('coral-Tag--green');
  });

  it('supports expanding to multiple lines via multiline', () => {
    const tree = shallow(<Tag multiline />);
    expect(tree.prop('className')).toInclude('coral-Tag--multiline');
  });

  it('supports a quiet variant', () => {
    const tree = shallow(<Tag quiet />);
    expect(tree.prop('className')).toInclude('coral-Tag--quiet');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tag className="myClass" />);
    expect(tree.prop('className')).toInclude('myClass');
  });

  it('supports being closable', () => {
    const tree = shallow(<Tag closable={ false } />);
    expect(tree.find('.coral-Tag-removeButton').node).toNotExist();
  });

  it('supports being disabled', () => {
    const onClose = expect.createSpy();
    const tree = shallow(<Tag disabled closable onClose={ onClose } />);
    tree.find('.coral-Tag-removeButton').simulate('click');
    expect(onClose).toNotHaveBeenCalled();
  });

  it('supports being selected', () => {
    const tree = shallow(<Tag selected />);
    expect(tree.prop('tabIndex')).toBe(0);
    expect(tree.prop('aria-selected')).toBe(true);
  });

  it('supports a value', () => {
    const tree = shallow(<Tag value="myValue" />);
    expect(tree.find('.coral-Tag-label').children().text()).toBe('myValue');
  });

  it('supports an onClose event', () => {
    const onClose = expect.createSpy();
    const tree = shallow(<Tag closable value="stuff" onClose={ onClose } />);
    tree.find('.coral-Tag-removeButton').simulate('click', {});
    const args = onClose.getLastCall().arguments;
    expect(args[0]).toBe('stuff');
    expect(args[1]).toEqual({});
  });

  it('has a valid aria-label', () => {
    const tree = shallow(<Tag>foo</Tag>);
    expect(tree.prop('aria-label')).toBe('Remove foo label');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tag className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Tag foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
