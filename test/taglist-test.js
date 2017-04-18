import React from 'react';
import expect, { createSpy } from 'expect';
import { shallow } from 'enzyme';
import Tag from '../src/TagList/js/Tag';
import TagList from '../src/TagList';

describe('TagList', () => {
  it('has correct classname when disabled', () => {
    const tree = shallow(<TagList disabled />);
    expect(tree.hasClass('is-disabled')).toBe(true);
  });

  it('has coral class', () => {
    const tree = shallow(<TagList />);
    expect(tree.hasClass('coral-TagList')).toBe(true);
  });

  it('passes in a custom class', () => {
    const tree = shallow(<TagList className="squid" />);
    expect(tree.hasClass('squid')).toBe(true);
  });

  it('sets the role', () => {
    const tree = shallow(<TagList />);
    expect(tree.prop('role')).toBe('listbox');
  });

  it('sets the name', () => {
    const tree = shallow(<TagList name="Friendly" />);
    expect(tree.prop('name')).toBe('Friendly');
  });

  it('sets the aria-disabled', () => {
    const tree = shallow(<TagList disabled />);
    expect(tree.prop('aria-disabled')).toBe(true);
  });

  it('sets the aria-invalid', () => {
    const tree = shallow(<TagList invalid />);
    expect(tree.prop('aria-invalid')).toBe(true);
  });

  it('sets readOnly', () => {
    const tree = shallow(<TagList readOnly />);
    expect(tree.prop('readOnly')).toBe(true);
  });

  it('sets the aria-required', () => {
    const tree = shallow(<TagList required />);
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('sets disabled on the element', () => {
    const tree = shallow(<TagList disabled />);
    expect(tree.prop('disabled')).toBe(true);
  });

  it('sets focused state when onFocus', () => {
    const spy = createSpy();
    const tree = shallow(<TagList onFocus={ spy } />);
    expect(tree.state('focused')).toBe(false);
    tree.simulate('focus');
    expect(spy).toHaveBeenCalled();
    expect(tree.state('focused')).toBe(true);
  });

  it('removes focused state when onBlur', () => {
    const spy = createSpy();
    const tree = shallow(<TagList onBlur={ spy } />).setState({ focused: true });
    tree.simulate('blur');
    expect(spy).toHaveBeenCalled();
    expect(tree.state('focused')).toBe(false);
  });

  describe('Children', () => {
    let tree;
    let child1;
    let child2;

    function run(props = {}, state = {}) {
      tree = shallow(
        <TagList { ...props }>
          <Tag className="one">Tag 1</Tag>
          <Tag className="two">Tag 2</Tag>
        </TagList>
      ).setState(state);
      child1 = tree.find('.one');
      child2 = tree.find('.two');
    }

    it('supports inline', () => {
      run();
      expect(child1.length).toBe(1);
    });

    it('sets selected when focused and selectedIndex exists', () => {
      run({}, { selectedIndex: 1, focused: true });
      expect(child1.prop('selected')).toBe(false);
      expect(child2.prop('selected')).toBe(true);
    });

    it('sets tab index when selectedIndex matches index', () => {
      run({}, { selectedIndex: 1 });
      expect(child1.prop('tabIndex')).toBe(-1);
      expect(child2.prop('tabIndex')).toBe(0);
    });

    it('doesn\'t set tab index when disabled', () => {
      run({ disabled: true }, { selectedIndex: 1 });
      expect(child1.prop('tabIndex')).toBe(-1);
      expect(child2.prop('tabIndex')).toBe(-1);
    });

    it('sets closable', () => {
      run();
      expect(child1.prop('closable')).toBe(true);
    });

    it('doest set closable when readOnly', () => {
      run({ readOnly: true });
      expect(child1.prop('closable')).toBe(false);
    });

    it('sets the role', () => {
      run();
      expect(child1.prop('role')).toBe('option');
    });

    it('sets selectedIndex when child is focused', () => {
      run();
      child2.simulate('focus');
      expect(tree.state('selectedIndex')).toBe(1);
    });

    it('passes down the onClose', () => {
      const onClose = createSpy();
      run({ onClose });
      child1.props().onClose('Tag 1');
      expect(onClose).toHaveBeenCalledWith('Tag 1');
    });

    it('supports values', () => {
      run({ values: ['test1', 'test2', 'test3'] });
      expect(tree.children().length).toBe(3);
    });

    it('doesnt render passed children with values', () => {
      run({ values: ['test1', 'test2'] });
      expect(child1.length).toBe(0);
    });

    it('sets the value', () => {
      run({ values: ['test1', 'test2'] });
      expect(tree.childAt(0).prop('value')).toBe('test1');
    });

    it('sets the text', () => {
      run({ values: ['test1', 'test2'] });
      expect(tree.childAt(1).prop('children')).toBe('test2');
    });
  });
});
