import {Button} from '../';
import {mount} from 'enzyme';
import React from 'react';

describe('Button tests', function () {
  let tree;
  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });
  test('handles defaults', function () {
    let onClick = jest.fn();
    tree = mount(<Button onClick={onClick} />);

    expect(tree.find('button').length).toBe(1);
    expect(tree.find('button').prop('className')).toEqual(expect.stringContaining('secondary'));
    expect(tree.find('a').length).toBe(0);

    tree.setProps({elementType: 'a'});

    expect(tree.find('a').length).toBe(1);
    expect(tree.find('button').length).toBe(0);
    expect(tree.find('a').prop('role')).toBe('button');
    expect(tree.find('a').prop('tabIndex')).toBe(0);

    tree.simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});
