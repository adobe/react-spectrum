import assert from 'assert';
import {ListItem} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const render = (props) => {
  const defaultProps = {
    label: 'Foo'
  };
  return shallow(<ListItem {...defaultProps} {...props} />);
};

describe('ListItem', () => {
  describe('handleMouseEnter', () => {
    let focusSpy;

    beforeEach(() => {
      focusSpy = sinon.spy();
    });

    it('should focus the currentTarget on mouseEnter if onMouseEnter is undefined', () => {
      const tree = render();
      tree.simulate('mouseenter', {currentTarget: {focus: focusSpy}});
      assert(focusSpy.called);
    });

    it('shouldn\'t focus the currentTarget on mouseEnter if onMouseEnter is supplied', () => {
      const tree = render({onMouseEnter: () => {}});
      tree.simulate('mouseenter', {currentTarget: {focus: focusSpy}});
      assert(!focusSpy.called);
    });
  });
});
