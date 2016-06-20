import React from 'react';
import expect from 'expect';
import Icon from '../src/Icon';
import { shallow } from 'enzyme';

describe('Icon', () => {
  it('supports icons', () => {
    const tree = shallow(<Icon icon="bell" />);
    expect(tree.prop('className')).toBe('coral-Icon coral-Icon--sizeM coral-Icon--bell');
    expect(tree.type()).toBe('i');
  });

  it('supports color icons', () => {
    const tree = shallow(<Icon icon="twitterColor" />);
    expect(tree.prop('className'))
      .toBe('coral-Icon coral-Icon--sizeM coral-Icon--twitterColor coral-ColorIcon');
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Icon icon="bell" size="L" />);
    expect(tree.prop('className')).toBe('coral-Icon coral-Icon--sizeL coral-Icon--bell');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Icon icon="bell" className="myClass" />);
    expect(tree.prop('className')).toBe('coral-Icon coral-Icon--sizeM coral-Icon--bell myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Icon icon="bell" foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
