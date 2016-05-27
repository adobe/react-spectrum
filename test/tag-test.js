import React from 'react';
import expect from 'expect';
import Tag from '../components/Tag';
import { shallow } from 'enzyme';

describe('Tag', () => {
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
  it('supports a quiet varient', () => {
    const tree = shallow(<Tag quiet />);
    expect(tree.prop('className')).toInclude('coral-Tag--quiet');
  });
  it('supports additional classNames', () => {
    const tree = shallow(<Tag className="myClass" />);
    expect(tree.prop('className')).toInclude('myClass');
  });
  it('supports being closeable', () => {
    const tree = shallow(<Tag closable />);
    expect(tree.find('.coral-Tag-removeButton').html()).toExist();
  });
  it('supports being disabled', () => {
    let onClose = expect.createSpy();
    const tree = shallow(<Tag disabled closable onClose={onClose} />);
    tree.find('.coral-Tag-removeButton').simulate('click');
    expect(onClose).toNotHaveBeenCalled();
  });
  it('supports a value', () => {
    const tree = shallow(<Tag value="myValue" />);
    expect(tree.find('.coral-Tag-label').children().text()).toBe('myValue');
  });
  it('supports an onClose event', () => {
    let onClose = expect.createSpy();
    const tree = shallow(<Tag closable value="stuff" onClose={onClose} />);
    tree.find('.coral-Tag-removeButton').simulate('click');
    expect(onClose).toHaveBeenCalledWith('stuff');
  });

});
